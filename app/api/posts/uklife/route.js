import { NextResponse } from "next/server"
import { getPostsFromCache, getUniqueSubTopicsFromCache } from "../../../../lib/posts-cache"

export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    // Get posts from Make.com cache instead of Notion
    let posts = getPostsFromCache("uklife")

    // Apply limit
    posts = posts.slice(0, limit)

    // Sort by published date (newest first)
    posts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    // Get unique sub topics from cached posts
    const uniqueSubTopics = getUniqueSubTopicsFromCache("uklife")

    return NextResponse.json({
      success: true,
      posts: posts,
      uniqueSubTopics: uniqueSubTopics,
      count: posts.length,
      category: "uklife",
      source: "make.com",
    })
  } catch (error) {
    console.error("Error fetching UK life posts:", error)
    return NextResponse.json({ error: "Failed to fetch UK life posts" }, { status: 500 })
  }
}
