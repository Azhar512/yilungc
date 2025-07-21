import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Import cache from webhook
let postsCache = {
  "book-reviews": [],
  uklife: [],
  lastUpdated: null,
}

export async function GET(request) {
  try {
    // Try to get cache from webhook module
    try {
      const webhookModule = await import("../../webhook/make-posts/route.js")
      postsCache = webhookModule.postsCache
    } catch (e) {
      console.log("Could not import cache, using empty cache")
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    let posts = postsCache["uklife"] || []
    posts = posts.slice(0, limit)
    posts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    const allSubTopics = posts.map((post) => post.sub_topic).filter(Boolean)
    const uniqueSubTopics = [...new Set(allSubTopics)]

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
