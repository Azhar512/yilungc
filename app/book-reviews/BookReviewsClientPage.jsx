"use client"
import { useState, useEffect } from "react"
import PostCard from "../../components/post-card"
import { getPostsByCategory } from "../..//lib/db"
import { BookOpen } from "lucide-react"
import { generateSlug } from "../../lib/utils"
import Header from "../../components/header" // Import Header

export default function BookReviewsClientPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uniqueTags, setUniqueTags] = useState([])

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      const allPosts = await getPostsByCategory("book-reviews", 50)
      console.log("Fetched book reviews:", allPosts)

      const tags = new Set()
      allPosts.forEach((post) => {
        if (post.tags) {
          post.tags.forEach((tag) => tags.add(tag))
        }
      })
      setUniqueTags(Array.from(tags).sort())

      setPosts(allPosts)
      console.log("Posts state updated:", allPosts.length, "posts")
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const pinnedPosts = posts.filter((post) => post.pinned)
  const nonPinnedPosts = posts.filter((post) => !post.pinned)

  // Sort non-pinned posts by newest first
  nonPinnedPosts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

  return (
    <div className="min-h-screen flex flex-col bg-background theme-book-reviews">
      {" "}
      {/* Added theme-book-reviews class */}
      <Header /> {/* Add Header here */}
      {/* Header Section */}
      <section className="bg-gradient-to-r from-accent via-primary to-secondary text-primary-foreground py-20 pt-32">
        {" "}
        {/* Added pt-32 for header clearance */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-foreground/20 backdrop-blur-sm rounded-full">
                <BookOpen className="w-12 h-12" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Book Reviews</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Dive into my literary journey. From timeless classics to contemporary masterpieces, discover books that
              have shaped my perspective and might inspire yours.
            </p>
          </div>
        </div>
      </section>
      {/* Posts Section - Grouped by Tag */}
      <section className="py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  {" "}
                  {/* Add ID and scroll offset */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-serif font-bold text-foreground">Pinned Reviews</h2>
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
                  <p className="text-muted-foreground">
                    Check back soon for my latest book reviews and recommendations!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
