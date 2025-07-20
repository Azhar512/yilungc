import { getPostsFromCache, getUniqueTagsFromCache, getUniqueSubTopicsFromCache } from "./posts-cache"

// Fallback to cache-based system instead of direct Notion queries
export async function getPostsByCategory(category, limit = 50) {
  console.log(`Getting posts for category: ${category} from Make.com cache`)

  try {
    // Get from Make.com cache first
    let posts = getPostsFromCache(category)

    if (posts.length === 0) {
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
    return getUniqueTagsFromCache(category)
  } catch (error) {
    console.error("Error getting unique tags from cache:", error)
    return []
  }
}

export async function getUniqueSubTopics(category) {
  try {
    return getUniqueSubTopicsFromCache(category)
  } catch (error) {
    console.error("Error getting unique sub topics from cache:", error)
    return []
  }
}

export async function getPostBySlug(category, slug) {
  try {
    const posts = getPostsFromCache(category)
    return posts.find((post) => post.slug === slug) || null
  } catch (error) {
    console.error(`Error getting post by slug (${slug}) for category ${category}:`, error)
    return null
  }
}
