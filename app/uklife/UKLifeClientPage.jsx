"use client"
import { useState, useEffect } from "react"
import PostCard from "../../components/post-card"
import { getPostsByCategory } from "../../lib/db"
import { Heart } from "lucide-react"
import { generateSlug } from "../../lib/utils"
import Header from "../../components/header" // Import Header

export default function UKLifeClientPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uniqueSubTopics, setUniqueSubTopics] = useState([])

  useEffect(() => {
    async function fetchPostsAndSubTopics() {
      setLoading(true)
      const allPosts = await getPostsByCategory("life-blog", 50)
      console.log("Fetched UK Life posts:", allPosts)

      const subTopics = new Set()
      allPosts.forEach((post) => {
        if (post.sub_topic) {
          subTopics.add(post.sub_topic)
        }
      })
      setUniqueSubTopics(Array.from(subTopics).sort())

      setPosts(allPosts)
      setLoading(false)
    }
    fetchPostsAndSubTopics()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header /> {/* Add Header here */}
      {/* Header Section */}
      <section className="bg-gradient-to-r from-secondary via-primary to-accent text-primary-foreground py-20 pt-32">
        {" "}
        {/* Added pt-32 for header clearance */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-foreground/20 backdrop-blur-sm rounded-full">
                <Heart className="w-12 h-12" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">UK Life</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Welcome to my personal space where I share life experiences, thoughts, and moments that have shaped who I
              am in the UK. Every story has a lesson, every moment has meaning.
            </p>
          </div>
        </div>
      </section>
      {/* Posts Section - Grouped by Sub-topic */}
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
          ) : uniqueSubTopics.length > 0 ? (
            <div className="space-y-16">
              {uniqueSubTopics.map((topic, blockIndex) => {
                const postsForTopic = posts.filter((post) => post.sub_topic === topic)
                if (postsForTopic.length === 0) return null

                return (
                  <div
                    key={topic}
                    id={generateSlug(topic)} // Add ID for scrolling
                    className="animate-slide-up pt-16 -mt-16" // pt-16 and -mt-16 for scroll offset
                    style={{ animationDelay: `${blockIndex * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-serif font-bold text-foreground">{topic}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {postsForTopic.map((post, postIndex) => (
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
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">No UK life stories yet</h3>
              <p className="text-muted-foreground">
                Check back soon for personal stories and life experiences in the UK!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
