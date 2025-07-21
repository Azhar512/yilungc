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

    console.log("Received raw data from Make.com:", JSON.stringify(body, null, 2))

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
      // Helper to safely get Notion property value
      const getNotionPropertyValue = (properties, propertyName, type) => {
        const prop = properties?.[propertyName]
        if (!prop) return null

        switch (type) {
          case "title":
          case "rich_text":
            return prop[type]?.[0]?.plain_text || null
          case "url":
            return prop[type] || null
          case "multi_select":
            return prop[type]?.map((item) => item.name).filter(Boolean) || []
          case "select":
          case "status":
            return prop[type]?.name || null
          case "people":
            return prop[type]?.[0]?.name || null
          case "date":
            return prop[type]?.start || null
          case "checkbox":
            return prop[type] || false
          case "files":
            return prop[type]?.[0]?.file?.url || prop[type]?.[0]?.external?.url || null
          default:
            return prop[type] || null
        }
      }

      const transformedPost = {
        id: post.id || `post-${Date.now()}-${index}`,
        // Directly access properties from the raw 'properties' object
        title: getNotionPropertyValue(post.properties, "Post name", "title") || "Untitled Post",
        content: getNotionPropertyValue(post.properties, "Post name", "title") || "Content from Notion", // Assuming content is also in Post name for now
        excerpt: getNotionPropertyValue(post.properties, "Post name", "title") || "Excerpt from Notion",
        status: getNotionPropertyValue(post.properties, "Status", "status") || "published",

        // Get all multi-select tags and combine them
        tags: [
          ...(getNotionPropertyValue(post.properties, "讀書心得", "multi_select") || []),
          ...(getNotionPropertyValue(post.properties, "英語學習", "multi_select") || []),
          ...(getNotionPropertyValue(post.properties, "人生其他", "multi_select") || []),
        ].filter(Boolean), // Filter out any nulls/empties

        featured_image:
          getNotionPropertyValue(post.properties, "Photo URL", "url") ||
          "/placeholder.svg?height=400&width=600&text=Blog+Post",
        published_at: getNotionPropertyValue(post.properties, "New post date", "date") || new Date().toISOString(),
        created_at: post.created_time || new Date().toISOString(), // Use top-level created_time
        updated_at: post.last_edited_time || new Date().toISOString(), // Use top-level last_edited_time
        author: getNotionPropertyValue(post.properties, "Owner", "people") || "Yilung C",
        platform: getNotionPropertyValue(post.properties, "Platform", "select") || "",
        content_type: getNotionPropertyValue(post.properties, "Content type", "select") || "",
        pinned: getNotionPropertyValue(post.properties, "Pinned", "checkbox") || false,
        public_url: post.public_url || "", // Use top-level public_url
        post_url: getNotionPropertyValue(post.properties, "Post URL", "url") || "", // Use property Post URL

        sub_topic: "General", // Default, can be refined based on tags
        category: "general",
        slug: generateSlug(getNotionPropertyValue(post.properties, "Post name", "title") || "untitled"),
        last_synced: new Date().toISOString(),
        raw_data: post, // Keep original data for debugging
      }

      // Refine sub_topic based on tags
      if (transformedPost.tags.includes("倫敦London")) transformedPost.sub_topic = "London"
      else if (transformedPost.tags.includes("在家創業")) transformedPost.sub_topic = "Homepreneur"
      // Add more sub_topic logic as needed

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
