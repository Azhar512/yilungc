import { NextResponse } from "next/server"
import { getPostsFromCache, getUniqueTagsFromCache } from "../../../../lib/posts-cache.js"

export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    // Get posts from Make.com cache
    let posts = getPostsFromCache("book-reviews")

    // Apply limit and sort
    posts = posts.slice(0, limit)
    posts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    // Get unique tags
    const uniqueTags = getUniqueTagsFromCache("book-reviews")

    return NextResponse.json({
      success: true,
      posts: posts,
      uniqueTags: uniqueTags,
      count: posts.length,
      category: "book-reviews",
      source: "make.com",
    })
  } catch (error) {
    console.error("Error fetching book review posts:", error)
    return NextResponse.json({ error: "Failed to fetch book review posts" }, { status: 500 })
  }
}
