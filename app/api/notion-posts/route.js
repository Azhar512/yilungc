import { NextResponse } from "next/server"
import { getPostsByCategory, getUniqueTags, getUniqueSubTopics } from "../../../lib/db"


export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    let posts = []
    let uniqueTags = []
    let uniqueSubTopics = []

    if (category === "book-reviews") {
      posts = await getPostsByCategory("book-reviews", limit)
      uniqueTags = await getUniqueTags("book-reviews")
    } else if (category === "uklife") {
      posts = await getPostsByCategory("uklife", limit)
      uniqueSubTopics = await getUniqueSubTopics("uklife")
    } else {
      
      return NextResponse.json({ error: "Category not specified or invalid" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      posts: posts,
      uniqueTags: uniqueTags,
      uniqueSubTopics: uniqueSubTopics,
      count: posts.length,
      category: category,
    })
  } catch (error) {
    console.error("Error fetching Notion posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}