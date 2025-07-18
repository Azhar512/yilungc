import { createPost } from "../../../../lib/db"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()

    // Extract data from payload
    const { title, content, excerpt, featured_image, tags, status, sub_topic, pinned } = body

    if (!title || !content || !status) {
      return NextResponse.json({ error: "Title, content, and status are required" }, { status: 400 })
    }

    let category = ""
    if (status.toLowerCase() === "book") {
      category = "book-reviews"
    } else if (status.toLowerCase() === "life") {
      category = "life-blog"
    } else {
      return NextResponse.json({ error: "Invalid status provided. Must be 'book' or 'life'." }, { status: 400 })
    }

    const postData = {
      title,
      slug: generateSlug(title), // Slug is generated here, but Notion doesn't have a direct 'slug' property
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      category: category,
      featured_image: featured_image || "/placeholder.svg?height=400&width=600",
      tags: tags || [],
      status: "published", // Always publish if received via webhook
      author: "Yilung C",
      sub_topic: sub_topic || null, // Add sub_topic
      pinned: !!pinned, // Convert to boolean
    }

    // Create post in Notion
    const newPost = await createPost(postData)

    return NextResponse.json({
      success: true,
      message: `Post for ${category} created successfully in Notion`,
      post: newPost,
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Failed to create post in Notion" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Unified Publish Webhook Endpoint",
    status: "Active",
    endpoint: "/api/webhook/publish",
    method: "POST",
    description: "Send posts to this endpoint. Include 'status' field ('book' or 'life').",
    example_payload: {
      title: "Your Post Title",
      content: "Full content of your post...",
      excerpt: "Short summary...",
      featured_image: "URL_to_image",
      tags: ["tag1", "tag2"],
      status: "book", // or "life"
      sub_topic: "Optional Sub Topic", // For UK Life page grouping
      pinned: true, // Optional: true to pin to top (for book reviews)
    },
  })
}
// Updated Fri 07/18/2025  4:33:45.76 
