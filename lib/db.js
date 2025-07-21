// Updated db.js file - no imports from posts-cache

export async function getPostsByCategory(category, limit = 50) {
  console.log(`Getting posts for category: ${category} from Make.com cache`)

  try {
    // Try to get cache from webhook module dynamically
    let posts = []
    try {
      const webhookModule = await import("../app/api/webhook/make-posts/route.js")
      const cache = webhookModule.postsCache
      posts = cache[category] || []
    } catch (e) {
      console.warn(`No posts found in cache for category: ${category}. Make sure Make.com is sending data.`)
      return []
    }

    // Apply limit and sort
    posts = posts.slice(0, limit)
    posts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    return posts
  } catch (error) {
    console.error("Error getting posts from cache:", error)
    return []
  }
}

export async function getUniqueTags(category) {
  try {
    const posts = await getPostsByCategory(category, 1000) // Get all posts
    const allTags = posts.flatMap((post) => post.tags || [])
    return [...new Set(allTags)].filter(Boolean)
  } catch (error) {
    console.error("Error getting unique tags from cache:", error)
    return []
  }
}

export async function getUniqueSubTopics(category) {
  try {
    const posts = await getPostsByCategory(category, 1000) // Get all posts
    const allSubTopics = posts.map((post) => post.sub_topic).filter(Boolean)
    return [...new Set(allSubTopics)]
  } catch (error) {
    console.error("Error getting unique sub topics from cache:", error)
    return []
  }
}

export async function getPostBySlug(category, slug) {
  try {
    const posts = await getPostsByCategory(category, 1000) // Get all posts
    return posts.find((post) => post.slug === slug) || null
  } catch (error) {
    console.error(`Error getting post by slug (${slug}) for category ${category}:`, error)
    return null
  }
}
