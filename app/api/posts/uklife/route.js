import { NextResponse } from "next/server"
import { getPostsByCategory, getUniqueSubTopics } from "../../../../lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    const posts = await getPostsByCategory("life-blog", limit)
    const uniqueSubTopics = await getUniqueSubTopics("life-blog")

    return NextResponse.json({
      success: true,
      posts: posts,
      uniqueSubTopics: uniqueSubTopics,
      count: posts.length,
      category: "life-blog",
    })
  } catch (error) {
    console.error("Error fetching UK life posts:", error)
    return NextResponse.json({ error: "Failed to fetch UK life posts" }, { status: 500 })
  }
}
