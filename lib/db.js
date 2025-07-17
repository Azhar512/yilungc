import { Client } from "@notionhq/client"
import { generateSlug } from "./utils"

// Initialize Notion client
// IMPORTANT: Set NOTION_API_KEY as an environment variable
const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = " 21f65d1f-6c1c-8068-a79f-c22a0ef8abd8"

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
  try {
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
          htmlContent += `<h2>${getHtmlFromRichText(block.heading_2.rich_text)}</h2>`
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
  } catch (error) {
    console.error("Error fetching Notion blocks:", error)
    return ""
  }
}

// Maps a Notion page object to your blog post structure
async function mapNotionPageToPost(page, includeContent = false) {
  const properties = page.properties
  const title = getPlainText(properties["Aa Post name"]?.title) || ""
  const label = getPlainText(properties.Label?.select?.name) || ""
  const statusNotion = getPlainText(properties.Status?.select?.name) || ""
  const published_at = properties["Post date original"]?.date?.start || new Date().toISOString()
  const featured_image = properties["Photo URL"]?.url || "/placeholder.svg?height=400&width=600"

  let category = "life-blog" // Default category
  let sub_topic = null
  let tags = []
  const pinned = properties.Pinned?.checkbox || false // Assuming 'Pinned' is a checkbox property

  // Logic to infer category, sub_topic, and tags based on the 'Label' property
  // This mapping is based on the screenshot provided and common blog categories
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
  ]
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
  ]

  if (bookReviewLabels.includes(label)) {
    category = "book-reviews"
    tags = [label] // Use Label as a single tag for book reviews
  } else if (ukLifeLabels.includes(label)) {
    category = "life-blog"
    sub_topic = label // Use Label as sub_topic for life blog
  }

  // Override category if 'Status' property explicitly indicates it (e.g., "Book", "Life")
  if (statusNotion.toLowerCase() === "book") {
    category = "book-reviews"
  } else if (statusNotion.toLowerCase() === "life") {
    category = "life-blog"
  }

  const status = statusNotion === "Ready for publish" ? "published" : "draft"
  const excerpt = getPlainText(properties.Excerpt?.rich_text) || title.substring(0, 150) + "..." // Assuming Excerpt is a rich text property, or derive from title
  const author = getPlainText(properties.Author?.rich_text) || "Yilung C" // Assuming Author is a rich text property

  const content = includeContent ? await getBlockChildrenHtml(page.id) : excerpt

  return {
    id: page.id,
    title,
    slug: generateSlug(title),
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

// Helper to query Notion database with common filters
async function queryNotionDatabase(filters = [], sorts = []) {
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [{ property: "Status", select: { equals: "Ready for publish" } }, ...filters],
      },
      sorts: sorts.length > 0 ? sorts : [{ property: "Post date original", direction: "descending" }],
    })
    return results
  } catch (error) {
    console.error("Error querying Notion database:", error)
    return []
  }
}

// Get all posts by category, with optional pinning and sub-topic grouping
export async function getPostsByCategory(category, limit = 20) {
  const notionPages = await queryNotionDatabase()
  const allPosts = await Promise.all(notionPages.map((page) => mapNotionPageToPost(page, false)))

  const filteredPosts = allPosts.filter((post) => post.category === category && post.status === "published")

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
  const notionPages = await queryNotionDatabase([
    {
      property: "Aa Post name", // Filter by title and then match slug
      title: {
        is_not_empty: true,
      },
    },
  ])

  const allPosts = await Promise.all(notionPages.map((page) => mapNotionPageToPost(page, true))) // Fetch full content

  const post = allPosts.find((p) => p.slug === slug && p.status === "published")
  if (!post) {
    throw new Error("Post not found")
  }
  return post
}

// Create new post (for webhook)
export async function createPost(postData) {
  try {
    const notionPage = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "Aa Post name": { title: [{ text: { content: postData.title } }] },
        Label: { select: { name: postData.sub_topic || (postData.tags && postData.tags[0]) || "Default" } }, // Map sub_topic/first tag to Label
        Status: { select: { name: postData.status === "published" ? "Ready for publish" : "Draft" } },
        "Post date original": { date: { start: postData.published_at || new Date().toISOString() } },
        "Photo URL": { url: postData.featured_image },
        // Add other properties if they exist in your Notion DB and you want to set them
        // "Excerpt": { rich_text: [{ text: { content: postData.excerpt } }] },
        // "Author": { rich_text: [{ text: { content: postData.author } }] },
        // "Pinned": { checkbox: postData.pinned },
      },
      // You can also add content blocks directly here if needed
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: postData.content,
                },
              },
            ],
          },
        },
      ],
    })
    console.log("Notion page created:", notionPage.id)
    return { id: notionPage.id, ...postData } // Return a simplified post object
  } catch (error) {
    console.error("Error creating Notion page:", error)
    throw new Error("Failed to create post in Notion.")
  }
}

// Get all unique sub-topics for a given category
export async function getUniqueSubTopics(category) {
  const notionPages = await queryNotionDatabase()
  const allPosts = await Promise.all(notionPages.map((page) => mapNotionPageToPost(page, false)))

  const subTopics = new Set()
  allPosts.forEach((post) => {
    if (post.category === category && post.status === "published" && post.sub_topic) {
      subTopics.add(post.sub_topic)
    }
  })
  return Array.from(subTopics).sort()
}

// Get all unique tags for a given category
export async function getUniqueTags(category) {
  const notionPages = await queryNotionDatabase()
  const allPosts = await Promise.all(notionPages.map((page) => mapNotionPageToPost(page, false)))

  const tags = new Set()
  allPosts.forEach((post) => {
    if (post.category === category && post.status === "published" && post.tags) {
      post.tags.forEach((tag) => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
}

// getRecentPosts is not directly used by the UI, but can be implemented if needed
// by querying Notion and sorting by date.
// getPostsBySubTopic is handled by getPostsByCategory and client-side filtering.
// getAllPosts is not directly used by the UI.
