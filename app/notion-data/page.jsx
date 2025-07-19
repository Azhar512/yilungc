"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { ExternalLink, RefreshCw } from "lucide-react"

export default function NotionDataPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)

  
  const fetchPosts = async () => {
    setLoading(true)
    try {
      
      const response = await fetch("/api/notion-posts")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notion SEO Posts</h1>
        <Button onClick={fetchPosts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
              <div className="flex gap-2">
                <Badge variant={post.status === "Ready f..." ? "default" : "secondary"}>{post.status}</Badge>
                {post.platform && <Badge variant="outline">{post.platform}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Content Type:</strong> {post.contentType}
                </p>
                <p>
                  <strong>Created:</strong> {new Date(post.createdTime).toLocaleDateString()}
                </p>
                <p>
                  <strong>Last Edited:</strong> {new Date(post.lastEditedTime).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                {post.url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Post URL
                    </a>
                  </Button>
                )}
                {post.publicUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={post.publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Notion
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts found. Make sure your Make.com webhook is sending data to the API endpoint.
          </p>
        </div>
      )}
    </div>
  )
}
