import { NextResponse } from "next/server"
import { getPostsByCategory, getUniqueTags } from "../../../../lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    const posts = await getPostsByCategory("book-reviews", limit)
    const uniqueTags = await getUniqueTags("book-reviews") // Pass category if needed for filtering tags

    return NextResponse.json({
      success: true,
      posts: posts,
      uniqueTags: uniqueTags,
      count: posts.length,
      category: "book-reviews",
    })
  } catch (error) {
    console.error("Error fetching book review posts:", error)
    return NextResponse.json({ error: "Failed to fetch book review posts" }, { status: 500 })
  }
}
