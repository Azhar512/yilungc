import { NextResponse } from "next/server"

// Simple in-memory cache - defined directly in this file
const postsCache = {
  "book-reviews": [],
  uklife: [],
  lastUpdated: null,
}

function generateSlug(text) {
  if (!text) return "untitled"
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(request) {
  try {
    console.log("Webhook received from Make.com")

    const body = await request.json()
    console.log("Received data:", JSON.stringify(body, null, 2))

    // Handle both single post and array of posts
    let posts = []
    if (Array.isArray(body)) {
      posts = body
    } else if (body.posts && Array.isArray(body.posts)) {
      posts = body.posts
    } else if (body.id || body.title) {
      posts = [body]
    } else {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    // Process posts
    const bookReviewPosts = []
    const ukLifePosts = []

    posts.forEach((post, index) => {
      const transformedPost = {
        id: post.id || `post-${Date.now()}-${index}`,
        title: post.title || post.name || "Untitled Post",
        content: post.content || "Content synced from Notion via Make.com",
        excerpt: (post.title || post.name || "").substring(0, 150) + "...",
        featured_image: post.photo_url || "/placeholder.png?height=400&width=600",
        published_at: post.created_time || new Date().toISOString(),
        created_at: post.created_time || new Date().toISOString(),
        updated_at: post.last_edited_time || new Date().toISOString(),
        author: post.owner || "Yilung C",
        tags: Array.isArray(post.tags) ? post.tags : [],
        pinned: post.pinned || false,
        sub_topic: post.sub_topic || post.label || "General",
        category: "general",
        slug: generateSlug(post.title || post.name || "untitled"),
        notion_url: post.public_url || "",
        original_post_url: post.post_url || "",
        last_synced: new Date().toISOString(),
      }

      // Simple categorization
      const postTitle = (transformedPost.title || "").toLowerCase()
      const postTags = transformedPost.tags.join(" ").toLowerCase()

      if (postTitle.includes("book") || postTags.includes("book") || postTags.includes("讀書")) {
        transformedPost.category = "book-reviews"
        bookReviewPosts.push(transformedPost)
      } else {
        transformedPost.category = "uklife"
        ukLifePosts.push(transformedPost)
      }
    })

    // Update cache
    postsCache["book-reviews"] = bookReviewPosts
    postsCache["uklife"] = ukLifePosts
    postsCache.lastUpdated = new Date().toISOString()

    return NextResponse.json({
      success: true,
      message: "Posts updated successfully via Make.com",
      counts: {
        "book-reviews": bookReviewPosts.length,
        uklife: ukLifePosts.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing Make.com webhook:", error)
    return NextResponse.json(
      {
        error: "Failed to process webhook data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    cache: postsCache,
    message: "Current posts cache from Make.com",
    timestamp: new Date().toISOString(),
  })
}

// Export cache for other files
export { postsCache }
