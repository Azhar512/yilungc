import { Client } from "@notionhq/client"
import { generateSlug } from "./utils" // Assuming generateSlug is in utils.js
import initialPosts from "./posts.json" // Import the local JSON data

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

// Simulate an in-memory database for demonstration purposes
// In a real app, this would be a persistent database
const posts = [...initialPosts]
console.log("Posts loaded from JSON:", posts.length, "posts")

// Simulate async operations for realistic behavior
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// --- Helper Functions for Notion Data Mapping ---

// Converts Notion rich text array to plain text
function getPlainText(richText) {
  if (!richText || richText.length === 0) return ""
  return richText.map((text) => text.plain_text).join("")
}

// Converts Notion rich text array to basic HTML
function getHtmlFromRichText(richText) {
  if (!richText || richText.length === 0) return ""
  return richText
    .map((block) => {
      let text = block.plain_text
      if (block.annotations.bold) text = `<strong>${text}</strong>`
      if (block.annotations.italic) text = `<em>${text}</em>`
      if (block.annotations.underline) text = `<u>${text}</u>`
      if (block.annotations.strikethrough) text = `<s>${text}</s>`
      if (block.annotations.code) text = `<code>${text}</code>`
      if (block.href) text = `<a href="${block.href}">${text}</a>`
      return text
    })
    .join("")
}

// Converts Notion block children to HTML
async function getBlockChildrenHtml(blockId) {
  const { results } = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 100, // Adjust as needed
  })

  let htmlContent = ""
  for (const block of results) {
    switch (block.type) {
      case "paragraph":
        htmlContent += `<p>${getHtmlFromRichText(block.paragraph.rich_text)}</p>`
        break
      case "heading_1":
        htmlContent += `<h1>${getHtmlFromRichText(block.heading_1.rich_text)}</h1>`
        break
      case "heading_2":
        htmlContent += `<h2>${getHtmlFromRichText(block.heading_2.rich_text)}</h1>`
        break
      case "heading_3":
        htmlContent += `<h3>${getHtmlFromRichText(block.heading_3.rich_text)}</h3>`
        break
      case "bulleted_list_item":
        htmlContent += `<li>${getHtmlFromRichText(block.bulleted_list_item.rich_text)}</li>`
        break
      case "numbered_list_item":
        htmlContent += `<li>${getHtmlFromRichText(block.numbered_list_item.rich_text)}</li>`
        break
      case "to_do":
        htmlContent += `<p><input type="checkbox" ${
          block.to_do.checked ? "checked" : ""
        } disabled /> ${getHtmlFromRichText(block.to_do.rich_text)}</p>`
        break
      case "image":
        htmlContent += `<img src="${block.image.external?.url || block.image.file?.url}" alt="Notion Image" />`
        break
      case "code":
        htmlContent += `<pre><code>${getPlainText(block.code.rich_text)}</code></pre>`
        break
      case "quote":
        htmlContent += `<blockquote>${getHtmlFromRichText(block.quote.rich_text)}</blockquote>`
        break
      case "divider":
        htmlContent += `<hr />`
        break
      // Add more block types as needed
      default:
        // console.warn(`Unhandled block type: ${block.type}`);
        break
    }
  }
  return htmlContent
}

// Maps a Notion page object to your blog post structure
async function mapNotionPageToPost(page, includeContent = false) {
  const properties = page.properties
  const title = getPlainText(properties.Title.title)
  const category = properties.Category.select?.name
  const sub_topic = properties["Sub Topic"]?.select?.name || null
  const tags = properties.Tags.multi_select.map((tag) => tag.name)
  const published_at = properties["Published At"].date?.start
  const status = properties.Status.select?.name
  const excerpt = getPlainText(properties.Excerpt.rich_text)
  const featured_image = properties["Featured Image"].url || "/placeholder.svg?height=400&width=600"
  const pinned = properties.Pinned?.checkbox || false
  const author = getPlainText(properties.Author.rich_text)

  let content = excerpt // Default content for list views

  if (includeContent) {
    content = await getBlockChildrenHtml(page.id)
  }

  return {
    id: page.id,
    title,
    slug: generateSlug(title), // Use your existing slug generator
    content,
    excerpt,
    category,
    sub_topic,
    author,
    published_at,
    featured_image,
    tags,
    status,
    pinned,
  }
}

// Get all posts by category, with optional pinning and sub-topic grouping
export async function getPostsByCategory(category, limit = 20) {
  await delay(100) // Simulate network delay
  const filteredPosts = posts.filter((post) => post.category === category && post.status === "published")

  // Sort: pinned first, then newest
  filteredPosts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.published_at) - new Date(a.published_at)
  })

  return filteredPosts.slice(0, limit)
}

// Get single post by slug
export async function getPostBySlug(slug) {
  await delay(100) // Simulate network delay
  const post = posts.find((p) => p.slug === slug && p.status === "published")
  if (!post) {
    throw new Error("Post not found")
  }
  return post
}

// Create new post (for webhook) - simulates adding to the in-memory array
export async function createPost(postData) {
  await delay(200) // Simulate network delay for creation
  const newPost = {
    id: String(posts.length + 1), // Simple ID generation
    published_at: new Date().toISOString(),
    ...postData,
    slug: generateSlug(postData.title),
    status: "published", // Ensure it's published when created via webhook
  }
  posts.push(newPost) // Add to in-memory array
  console.log("Simulated new post creation:", newPost) // Log for demonstration
  return newPost
}

// Get recent posts for homepage
export async function getRecentPosts(limit = 6) {
  await delay(100) // Simulate network delay
  const publishedPosts = posts.filter((post) => post.status === "published")
  publishedPosts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  return publishedPosts.slice(0, limit)
}

// Get all unique sub-topics for a given category
export async function getUniqueSubTopics(category) {
  await delay(100) // Simulate network delay
  const subTopics = new Set()
  posts.forEach((post) => {
    if (post.category === category && post.status === "published" && post.sub_topic) {
      subTopics.add(post.sub_topic)
    }
  })
  return Array.from(subTopics).sort()
}

// Get posts by sub-topic
export async function getPostsBySubTopic(category, subTopic, limit = 5) {
  await delay(100) // Simulate network delay
  const filteredPosts = posts.filter(
    (post) => post.category === category && post.status === "published" && post.sub_topic === subTopic,
  )
  filteredPosts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  return filteredPosts.slice(0, limit)
}

// Get all unique tags for a given category
export async function getUniqueTags(category) {
  await delay(100) // Simulate network delay
  const tags = new Set()
  posts.forEach((post) => {
    if (post.category === category && post.status === "published" && post.tags) {
      post.tags.forEach((tag) => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
}

// Get all posts (for admin purposes) - not used in current UI, but kept for completeness
export async function getAllPosts() {
  await delay(100) // Simulate network delay
  return posts.filter((post) => post.status === "published")
}
