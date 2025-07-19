"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { ExternalLink, RefreshCw, Database } from "lucide-react"

export default function NotionDashboard() {
  const [syncStatus, setSyncStatus] = useState("idle")
  const [lastSync, setLastSync] = useState(null)
  const [recentPosts, setRecentPosts] = useState([])

  const testWebhook = async () => {
    setSyncStatus("testing")
    try {
      
      const response = await fetch("/api/posts/book-reviews", {
        
        method: "GET",
      })
      const data = await response.json()
      console.log("Data fetch test:", data)
      if (data.success) {
        setSyncStatus("success")
        setLastSync(new Date().toISOString())
        setRecentPosts(data.posts)
      } else {
        setSyncStatus("error")
      }
    } catch (error) {
      console.error("Data fetch test failed:", error)
      setSyncStatus("error")
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Notion Integration Dashboard</h1>
        <p className="text-muted-foreground">Monitor your Notion → Make.com → Website integration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={syncStatus === "success" ? "default" : "secondary"}>
                {syncStatus === "idle" ? "Ready" : syncStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Endpoint: /api/notion-webhook</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastSync ? new Date(lastSync).toLocaleTimeString() : "Never"}</div>
            <p className="text-xs text-muted-foreground">
              {lastSync ? new Date(lastSync).toLocaleDateString() : "No sync yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Synced (Last Test)</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPosts.length}</div>
            <p className="text-xs text-muted-foreground">Posts fetched from API</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Integration Setup</h2>
          <Button onClick={testWebhook} disabled={syncStatus === "testing"}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === "testing" ? "animate-spin" : ""}`} />
            Test Data Fetch
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Make.com Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recommended Make.com Scenario Flow:</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                <p>
                  1. **Notion Module (Trigger):** "Watch Database Items"
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;Configure to watch your "SEO post" database.
                </p>
                <p className="mt-2">
                  2. **HTTP Module (Action):** "Make a request"
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;**URL:**{" "}
                  {typeof window !== "undefined" ? window.location.origin : "https://yilungc-gid8.vercel.app/"}
                  /api/notion-webhook
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;**Method:** POST
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;**Headers:** Content-Type: application/json
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;**Body:** Map all Notion bundle data from the "Watch Database Items" module.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Your Next.js Webhook Endpoint:</h4>
              <div className="space-y-2">
                <Badge variant="default">/api/notion-webhook (Receives data from Make.com)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
