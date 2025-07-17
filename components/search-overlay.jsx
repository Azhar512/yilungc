"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDate } from "../lib/utils"

export default function SearchOverlay({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Focus the input when the dialog opens
      setTimeout(() => inputRef.current?.focus(), 100)
      // Reset search when opening
      setSearchTerm("")
      setSearchResults([])
    }
  }, [isOpen])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setLoading(true)
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(searchTerm)}`)
          const data = await response.json()
          setSearchResults(data)
        } catch (error) {
          console.error("Error fetching search results:", error)
          setSearchResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300) // Debounce for 300ms

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 border-none bg-transparent shadow-none">
        <div className="relative bg-card rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center p-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search posts..."
              className="flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />}
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-4">
            {searchTerm.length > 0 && searchResults.length === 0 && !loading && (
              <p className="text-muted-foreground text-center py-8">No results found for "{searchTerm}".</p>
            )}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${post.category === "life-blog" ? "uklife" : post.category}/${post.slug}`}
                    onClick={onClose}
                    className="block p-3 rounded-md hover:bg-muted transition-colors"
                  >
                    <h3 className="font-semibold text-foreground line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span>{formatDate(post.published_at)}</span>
                      <span className="mx-2">•</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          post.category === "book-reviews"
                            ? "bg-accent/10 text-accent"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {post.category === "book-reviews" ? "Book Review" : "UK Life"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
