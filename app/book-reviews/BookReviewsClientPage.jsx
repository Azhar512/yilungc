"use client"

import { useEffect } from "react"
import PostCard from "../../components/post-card"
import { BookOpen, RefreshCw } from "lucide-react"
import Header from "../../components/header"
import Image from "next/image"
import { Button } from "../../components/ui/button"
import { useNotionPosts } from "../../hooks/use-notion-posts" // Corrected import path

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters except spaces and hyphens
    .trim() // Trim whitespace from both ends
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
}

// Accept initialPosts and initialUniqueTags as props
export default function BookReviewsClientPage({ initialPosts, initialUniqueTags }) {
  // Use the custom hook for real-time updates
  const { data, loading, error, refresh } = useNotionPosts("/api/posts/book-reviews", {
    posts: initialPosts,
    uniqueTags: initialUniqueTags,
  })

  const posts = data?.posts || initialPosts || []
  const uniqueTags = data?.uniqueTags || initialUniqueTags || []

  // Auto-refresh every 5 minutes to catch webhook updates
  useEffect(() => {
    const interval = setInterval(
      () => {
        refresh()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [refresh])

  const pinnedPosts = posts.filter((post) => post.pinned)
  const nonPinnedPosts = posts.filter((post) => !post.pinned)

  // Sort non-pinned posts by newest first
  nonPinnedPosts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

  return (
    <div className="min-h-screen flex flex-col bg-background theme-book-reviews">
      <Header />

      {/* Header Section */}
      <section className="relative bg-gradient-to-r from-accent via-primary to-secondary text-primary-foreground py-20 pt-32 overflow-hidden">
        <Image
          src="/images/bookreview.png" // Corrected image path
          alt="Book Reviews Header"
          fill
          className="object-cover absolute inset-0 opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-foreground/20 backdrop-blur-sm rounded-full">
                <BookOpen className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Book Reviews</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-6">
              Dive into my literary journey. From timeless classics to contemporary masterpieces, discover books that
              have shaped my perspective and might inspire yours.
            </p>
            <Button
              onClick={refresh}
              variant="secondary"
              disabled={loading}
              className="animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Posts Section - Grouped by Tag */}
      <section className="py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
              <p className="text-red-800">Error loading reviews: {error}</p>
              <Button onClick={refresh} variant="outline" size="sm" className="mt-2 bg-transparent">
                Try Again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          ) : (
            <>
              {/* Pinned Posts Section */}
              {pinnedPosts.length > 0 && (
                <div id="pinned-reviews" className="mb-16 animate-slide-up pt-16 -mt-16">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-serif font-bold text-foreground">Pinned Reviews</h2>
                    <span className="text-sm text-muted-foreground">
                      {pinnedPosts.length} pinned review{pinnedPosts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pinnedPosts.map((post, index) => (
                      <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <PostCard post={post} featured={true} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Tag Sections */}
              {uniqueTags.length > 0 ? (
                <div className="space-y-16">
                  {uniqueTags.map((tag, blockIndex) => {
                    const postsForTag = nonPinnedPosts.filter((post) => post.tags && post.tags.includes(tag))
                    if (postsForTag.length === 0) return null
                    return (
                      <div
                        key={tag}
                        id={generateSlug(tag)} // Add ID for scrolling
                        className="animate-slide-up pt-16 -mt-16" // Add scroll offset
                        style={{ animationDelay: `${blockIndex * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-3xl font-serif font-bold text-foreground">#{tag}</h2>
                          <span className="text-sm text-muted-foreground">
                            {postsForTag.length} review{postsForTag.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {postsForTag.map((post, postIndex) => (
                            <div
                              key={post.id}
                              className="animate-fade-in"
                              style={{ animationDelay: `${postIndex * 0.05}s` }}
                            >
                              <PostCard post={post} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">No book reviews yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Check back soon for my latest book reviews and recommendations!
                  </p>
                  <Button onClick={refresh} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check for Updates
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
