// In-memory posts cache for Make.com data
export const postsCache = {
  "book-reviews": [],
  uklife: [],
  lastUpdated: null,
}

export function updatePostsCache(category, posts) {
  postsCache[category] = posts
  postsCache.lastUpdated = new Date().toISOString()
  console.log(`Updated ${category} cache with ${posts.length} posts`)
}

export function getPostsFromCache(category) {
  return postsCache[category] || []
}

export function getUniqueTagsFromCache(category) {
  const posts = getPostsFromCache(category)
  const allTags = posts.flatMap((post) => post.tags || [])
  return [...new Set(allTags)].filter(Boolean)
}

export function getUniqueSubTopicsFromCache(category) {
  const posts = getPostsFromCache(category)
  const allSubTopics = posts.map((post) => post.sub_topic).filter(Boolean)
  return [...new Set(allSubTopics)]
}

export function getCacheInfo() {
  return {
    lastUpdated: postsCache.lastUpdated,
    counts: {
      "book-reviews": postsCache["book-reviews"].length,
      uklife: postsCache["uklife"].length,
    },
    totalPosts: postsCache["book-reviews"].length + postsCache["uklife"].length,
  }
}

export function generateSlug(text) {
  if (!text) return "untitled"
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
