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
          safeGet(post, "featured_image", "photo_url", "image", "Image", "cover") ||
          "/placeholder.svg?height=400&width=600&text=Blog+Post",
        published_at:
          safeGet(post, "published_at", "created_time", "date", "Date", "publish_date") || new Date().toISOString(),
        created_at: safeGet(post, "created_at", "created_time", "date") || new Date().toISOString(),
        updated_at: safeGet(post, "updated_at", "last_edited_time", "modified") || new Date().toISOString(),
        author: safeGet(post, "author", "Author", "owner", "Owner", "created_by") || "Yilung C",

        // --- ENHANCED TAG HANDLING ---
        tags: (() => {
          const allTags = []
          const notionTags = safeGet(post, "notion_tags") // New property from Make.com
          const readingExpTags = safeGet(post, "reading_experience_tags") // New property from Make.com
          const otherLifeTags = safeGet(post, "other_life_tags") // New property from Make.com
          const englishLearningTags = safeGet(post, "english_learning_tags") // New property from Make.com

          // Combine all potential tag sources, ensuring they are arrays
          const addTags = (source) => {
            if (Array.isArray(source)) {
              allTags.push(
                ...source.map((tag) => (typeof tag === "object" && tag !== null ? tag.name : tag)).filter(Boolean),
              )
            } else if (typeof source === "string" && source.trim() !== "") {
              allTags.push(source.trim())
            }
          }

          addTags(notionTags)
          addTags(readingExpTags)
          addTags(otherLifeTags)
          addTags(englishLearningTags)

          // Remove duplicates and return
          return [...new Set(allTags)]
        })(),
        // --- END ENHANCED TAG HANDLING ---

        pinned: safeGet(post, "pinned", "Pinned", "featured") || false,
        sub_topic: safeGet(post, "sub_topic", "subtopic", "category", "Category", "label", "Label") || "General",
        category: "general",
        slug: generateSlug(safeGet(post, "title", "Title", "name", "blog_value") || "untitled"),
        notion_url: safeGet(post, "notion_url", "public_url", "url", "URL") || "",
        original_post_url: safeGet(post, "original_post_url", "post_url", "link", "Link") || "",
        last_synced: new Date().toISOString(),
        raw_data: post, // Keep original data for debugging
      }

      // CATEGORIZATION
      const postTitle = (transformedPost.title || "").toLowerCase()
      const postTags = transformedPost.tags.join(" ").toLowerCase()
      const postContent = (transformedPost.content || "").toLowerCase()

      if (
        postTitle.includes("book") ||
        postTags.includes("book") ||
        postTags.includes("讀書") ||
        postTags.includes("reading") ||
        postContent.includes("book") ||
        postContent.includes("review")
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
