"use client"

import { useEffect } from "react"
import PostCard from "../../components/post-card"
import { Heart, RefreshCw } from "lucide-react"
import Header from "../../components/header"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { useNotionPosts } from "../../hooks/use-notion-posts"
import { generateSlug } from "../../lib/utils" // Corrected import path

export default function UKLifeClientPage({ initialPosts, initialUniqueSubTopics }) {
  // Use the custom hook for real-time updates
  const { data, loading, error, refresh } = useNotionPosts("/api/posts/uklife", {
    posts: initialPosts,
    uniqueSubTopics: initialUniqueSubTopics,
  })

  const posts = data?.posts || initialPosts || []
  const uniqueSubTopics = data?.uniqueSubTopics || initialUniqueSubTopics || []

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

  return (
    <div className="min-h-screen flex flex-col bg-background theme-uk-life">
      <Header />

      {/* Hero Section - Updated to solid background */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden pt-16 bg-background">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
          {/* Left Content Area */}
          <div className="text-foreground text-center md:text-left flex flex-col justify-center h-full">
            <h1
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Life In <br />
              <span className="uk-life-gradient-text">United Kingdom</span>
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              Discover personal stories, travel experiences, and insights into life in the United Kingdom. From bustling
              cities to serene countryside, explore the charm and nuances of British living.
            </p>
            <div className="flex gap-4 items-center">
              <Link
                href="#posts-section"
                className="inline-block w-fit mx-auto md:mx-0 px-8 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary-hover transition-colors duration-300 animate-slide-up"
                style={{ animationDelay: "0.6s" }}
              >
                Read More
              </Link>
              <Button
                onClick={refresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="animate-slide-up bg-transparent"
                style={{ animationDelay: "0.7s" }}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="hidden md:flex items-center justify-center h-full p-8">
            <div
              className="relative w-full h-full max-w-md max-h-[400px] lg:max-h-[500px] animate-scale-in group"
              style={{ animationDelay: "0.8s" }}
            >
              <Image
                src="/images/uklife1.png" // Corrected image path
                alt="UK Life Decorative"
                fill
                className="object-cover rounded-lg shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section - Grouped by Sub-topic */}
      <section id="posts-section" className="py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
              <p className="text-red-800">Error loading posts: {error}</p>
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
                      <span className="text-sm text-muted-foreground">
                        {postsForTopic.length} post{postsForTopic.length !== 1 ? "s" : ""}
                      </span>
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
              <Button onClick={refresh} variant="outline" className="mt-4 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for Updates
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
