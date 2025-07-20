import { NextResponse } from "next/server"
import { updatePostsCache, generateSlug } from "../../../lib/posts-cache"

export async function POST(request) {
  try {
    const body = await request.json()
    console.log("Received data from Make.com:", body)

    // Handle both single post and array of posts
    let posts = []
    if (Array.isArray(body)) {
      posts = body
    } else if (body.posts && Array.isArray(body.posts)) {
      posts = body.posts
    } else if (body.id) {
      // Single post
      posts = [body]
    } else {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    // Process and categorize posts
    const bookReviewPosts = []
    const ukLifePosts = []

    posts.forEach((post) => {
      // Transform Make.com/Notion data to your format
      const transformedPost = {
        id: post.id || post.notion_id || Date.now().toString(),
        notion_id: post.id || post.notion_id,
        title: post.title || post.name || post["Aa Post name"] || "Untitled",
        slug: generateSlug(post.title || post.name || post["Aa Post name"] || "untitled"),
        content: post.content || `<p>This post was synced from Notion via Make.com.</p>`,
        excerpt: post.excerpt || (post.title || post.name || "").substring(0, 150) + "...",
        category: post.category || "general",
        featured_image: post.photo_url || post.featured_image || "/placeholder.png?height=400&width=600",
        tags: post.tags || post["讀書心得"] || post["人生其他"] || [],
        author: post.author || post.owner || "Yilung C",
        sub_topic: post.sub_topic || post.label || post["Label"] || "General",
        pinned: post.pinned || false,
        created_at: post.created_at || post.created_time || new Date().toISOString(),
        updated_at: post.updated_at || post.last_edited_time || new Date().toISOString(),
        published_at: post.published_at || post["New post date"] || post.created_time || new Date().toISOString(),
        notion_url: post.notion_url || post.public_url || "",
        original_post_url: post.original_post_url || post.post_url || "",
        page_category: post.page_category || post.category,
        last_synced: new Date().toISOString(),
      }

      // Categorize posts based on your existing logic
      const bookReviewLabels = [
        "讀書心得",
        "一人公司",
        "HerRead",
        "Taiwan and Transitional Justice",
        "Parenting",
        "Business and Startups",
        "Life and Finance",
        "Science Fiction",
        "Philosophy",
        "Fiction",
        "Classic",
        "Contemporary",
        "Humor",
        "Adventure",
        "Reading List",
        "Poems",
        "Book",
      ]

      const ukLifeLabels = [
        "倫敦生活",
        "倫敦育兒",
        "母職生活",
        "英國私立",
        "英國旅遊",
        "個人議題",
        "Daily Life",
        "Culture & Society",
        "Outdoor Activities",
        "Edinburgh",
        "London Afternoon Tea",
        "London restaurants",
        "London never gets boring",
        "Travel with kids in UK",
        "Travel with kids abroad",
        "Raising kids in London",
        "Oversea family",
        "Being a Mother",
        "Personal Thoughts",
        "看房紀錄",
        "居家裝修",
        "房產知識",
      ]

      const postTags = Array.isArray(transformedPost.tags) ? transformedPost.tags : []
      const hasBookReviewTag = postTags.some((tag) => bookReviewLabels.includes(tag))
      const hasUkLifeTag = postTags.some((tag) => ukLifeLabels.includes(tag))

      if (hasBookReviewTag || transformedPost.page_category === "book-reviews") {
        transformedPost.category = "book-reviews"
        bookReviewPosts.push(transformedPost)
      } else if (hasUkLifeTag || transformedPost.page_category === "uklife") {
        transformedPost.category = "uklife"
        ukLifePosts.push(transformedPost)
      }
    })

    // Update cache
    updatePostsCache("book-reviews", bookReviewPosts)
    updatePostsCache("uklife", ukLifePosts)

    console.log(`Cache updated: ${bookReviewPosts.length} book reviews, ${ukLifePosts.length} UK life posts`)

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
  const { postsCache, getCacheInfo } = await import("../../../lib/posts-cache")
  return NextResponse.json({
    success: true,
    cache: postsCache,
    info: getCacheInfo(),
    message: "Current posts cache from Make.com",
  })
}
