"use client"

import { useState, useEffect, useCallback } from "react"

export function useNotionPosts(apiEndpoint, initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiEndpoint, {
        cache: "no-store", 
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        throw new Error(result.error || "Failed to fetch data")
      }
    } catch (err) {
      setError(err.message)
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint])

  useEffect(() => {
    if (!initialData) {
      fetchData()
    }
  }, [fetchData, initialData])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refresh,
  }
}
