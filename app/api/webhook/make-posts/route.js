import { NextResponse } from "next/server"

// Simple in-memory cache
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
    console.log("=== WEBHOOK RECEIVED ===")

    let body
    try {
      body = await request.json()
    } catch (e) {
      console.log("Failed to parse JSON, trying text...")
      const text = await request.text()
      console.log("Received text:", text)
      return NextResponse.json({ error: "Invalid JSON format", received: text }, { status: 400 })
    }

    console.log("Received data:", JSON.stringify(body, null, 2))

    // ACCEPT ANY DATA FORMAT - SUPER FLEXIBLE
    let posts = []

    if (Array.isArray(body)) {
      posts = body
    } else if (body && typeof body === "object") {
      posts = [body]
    } else {
      return NextResponse.json({ error: "No valid data received" }, { status: 400 })
    }

    console.log(`Processing ${posts.length} posts`)

    const bookReviewPosts = []
    const ukLifePosts = []

    posts.forEach((post, index) => {
      // SUPER FLEXIBLE DATA EXTRACTION
      const safeGet = (obj, ...keys) => {
        for (const key of keys) {
          if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
            return obj[key]
          }
        }
        return null
      }

      const transformedPost = {
        id: safeGet(post, "id", "ID", "_id") || `post-${Date.now()}-${index}`,
        title: safeGet(post, "title", "Title", "name", "blog_value", "Blog") || "Untitled Post",
        content:
          safeGet(post, "content", "Content", "description", "blog_value", "Main Content") || "Content from Notion",
        excerpt: (safeGet(post, "title", "Title", "blog_value") || "Untitled Post").substring(0, 150) + "...",
        featured_image:
          safeGet(post, "photo_url", "Photo URL", "image") || "/placeholder.svg?height=400&width=600&text=Blog+Post",
        published_at: safeGet(post, "created_time", "created_at", "date") || new Date().toISOString(),
        created_at: safeGet(post, "created_time", "created_at") || new Date().toISOString(),
        updated_at: safeGet(post, "last_edited_time", "updated_at") || new Date().toISOString(),
        author: safeGet(post, "author", "owner") || "Yilung C",
        tags: (() => {
          const tags = []
          const readingExp = safeGet(post, "reading_exp", "Reading Experience", "讀書心得")
          const otherLife = safeGet(post, "other_life", "Other Life", "人生其他")
          const regularTags = safeGet(post, "tags")

          if (readingExp) tags.push(readingExp)
          if (otherLife) tags.push(otherLife)
          if (Array.isArray(regularTags)) tags.push(...regularTags)
          if (typeof regularTags === "string") tags.push(regularTags)

          return tags.filter(Boolean)
        })(),
        pinned: safeGet(post, "pinned") || false,
        sub_topic: safeGet(post, "sub_topic", "category", "other_life", "Other Life") || "General",
        category: "general",
        slug: generateSlug(safeGet(post, "title", "Title", "blog_value") || "untitled"),
        notion_url: safeGet(post, "notion_url", "public_url") || "",
        original_post_url: safeGet(post, "post_url", "Post URL") || "",
        last_synced: new Date().toISOString(),
      }

      // CATEGORIZATION
      const postTitle = (transformedPost.title || "").toLowerCase()
      const postTags = transformedPost.tags.join(" ").toLowerCase()

      if (
        postTitle.includes("book") ||
        postTags.includes("book") ||
        postTags.includes("讀書") ||
        postTags.includes("reading")
      ) {
        transformedPost.category = "book-reviews"
        bookReviewPosts.push(transformedPost)
      } else {
        transformedPost.category = "uklife"
        ukLifePosts.push(transformedPost)
      }
    })

    // UPDATE CACHE
    postsCache["book-reviews"] = bookReviewPosts
    postsCache["uklife"] = ukLifePosts
    postsCache.lastUpdated = new Date().toISOString()

    console.log(`✅ SUCCESS: ${bookReviewPosts.length} book reviews, ${ukLifePosts.length} uklife posts`)

    return NextResponse.json({
      success: true,
      message: "Posts updated successfully!",
      counts: {
        "book-reviews": bookReviewPosts.length,
        uklife: ukLifePosts.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Webhook processing failed",
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
    message: "Current cache status",
    timestamp: new Date().toISOString(),
  })
}

export { postsCache }
