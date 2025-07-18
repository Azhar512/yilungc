// Import necessary functions
import fs from "fs"
import path from "path"
import { Notion } from "./notion" // Assuming lib/notion.js is correctly set up
import { generateSlug } from "./utils" // Assuming lib/utils.js exists

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID

// Helper to map Notion page properties to your desired post format
function mapNotionPageToPost(page) {
  const properties = page.properties

  // Helper to safely get property values
  const getTitle = (prop) => prop?.title?.[0]?.plain_text || ""
  const getRichText = (prop) => prop?.rich_text?.[0]?.plain_text || ""
  const getSelect = (prop) => prop?.select?.name || ""
  const getUrl = (prop) => prop?.url || ""
  const getFiles = (prop) => prop?.files?.[0]?.file?.url || prop?.files?.[0]?.external?.url || ""
  const getCheckbox = (prop) => prop?.checkbox || false
  const getDate = (prop) => prop?.date?.start || ""

  const title = getTitle(properties["Aa Post name"])
  const status = getSelect(properties["Status"])
  const label = getSelect(properties["Label"]) // Use "Label" or "英國房產" based on your Notion setup
  const photoUrl = getFiles(properties["Photo URL"])
  const platform = getSelect(properties["Platform"])
  const contentType = getSelect(properties["Content type"])
  const owner = getRichText(properties["Owner"]) // Assuming owner is rich text
  const postUrl = getUrl(properties["Post URL"])
  const pinned = getCheckbox(properties["Pinned"])
  const createdTime = page.created_time
  const lastEditedTime = page.last_edited_time
  const publicUrl = page.public_url // Notion's public URL for the page

  // Determine category based on your Notion labels/statuses
  let pageCategory = "general"
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
    "Book", // Added based on your Notion screenshot
  ]

  if (bookReviewLabels.includes(label) || status.toLowerCase().includes("book")) {
    pageCategory = "book-reviews"
  } else if (ukLifeLabels.includes(label) || status.toLowerCase().includes("life")) {
    pageCategory = "uklife"
  }

  return {
    id: page.id,
    notion_id: page.id,
    title: title,
    slug: generateSlug(title),
    content: `<p>This post was synced from Notion.</p><p><strong>Platform:</strong> ${platform}</p><p><strong>Content Type:</strong> ${contentType}</p>`, // Placeholder, full content needs separate fetch
    excerpt: getRichText(properties["Excerpt"]) || title.substring(0, 150) + "...",
    category: pageCategory, // This will be used for routing
    featured_image: photoUrl || "/placeholder.svg?height=400&width=600",
    tags: [platform, contentType, status, label].filter(Boolean), // Include label in tags
    status: status,
    author: owner || "Yilung C",
    sub_topic: label, // Use label as sub_topic for UK Life
    pinned: pinned,
    created_at: createdTime,
    updated_at: lastEditedTime,
    published_at: getDate(properties["New post date"]) || createdTime, // Use "New post date" if available
    notion_url: publicUrl,
    original_post_url: postUrl,
    page_category: pageCategory, // Redundant but useful for filtering
    last_synced: new Date().toISOString(), // This field is for local tracking, not from Notion directly
  }
}

export async function getPostsByCategory(category, limit = 50) {
  if (!NOTION_DATABASE_ID) {
    console.error("NOTION_DATABASE_ID is not set.")
    return []
  }

  let filter = {}
  // Filter by 'Status' and 'Label' properties to match your Notion setup
  // and ensure posts are "Ready for Publish"
  const commonFilters = [
    {
      property: "Status",
      select: {
        equals: "Ready for Publish", // Only show posts that are ready for publish
      },
    },
  ]

  if (category === "book-reviews") {
    filter = {
      or: [
        {
          property: "Status",
          select: {
            equals: "Book", // Matches 'Book' status
          },
        },
        {
          property: "Label", // Assuming 'Label' is the property for categories like '讀書心得'
          select: {
            equals: "讀書心得",
          },
        },
        {
          property: "Label",
          select: {
            equals: "一人公司",
          },
        },
        {
          property: "Label",
          select: {
            equals: "HerRead",
          },
        },
        // Add other specific book review labels if needed
      ],
    }
  } else if (category === "uklife") {
    filter = {
      or: [
        {
          property: "Status",
          select: {
            equals: "Life and Finance", // Matches 'Life and Finance' status
          },
        },
        {
          property: "Label", // Assuming 'Label' is the property for categories like '看房紀錄'
          select: {
            equals: "看房紀錄",
          },
        },
        {
          property: "Label",
          select: {
            equals: "居家裝修",
          },
        },
        {
          property: "Label",
          select: {
            equals: "房產知識",
          },
        },
        // Add other specific UK life labels if needed
      ],
    }
  }

  const combinedFilter = {
    and: [filter, ...commonFilters],
  }

  try {
    const response = await Notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: combinedFilter,
      sorts: [
        {
          property: "New post date", // Or "Created time" if "New post date" is not used
          direction: "descending",
        },
      ],
      page_size: limit,
    })

    const posts = response.results.map(mapNotionPageToPost)
    return posts
  } catch (error) {
    console.error("Error querying Notion database:", error)
    throw error
  }
}

// Helper to get unique tags/subtopics directly from Notion properties
export async function getUniqueTags(category) {
  if (!NOTION_DATABASE_ID) return []
  try {
    const response = await Notion.databases.retrieve({ database_id: NOTION_DATABASE_ID })
    const tagsProperty = response.properties["Label"] // Assuming 'Label' is your primary tag/subtopic property
    if (tagsProperty && tagsProperty.type === "select") {
      return tagsProperty.select.options.map((option) => option.name)
    }
    return []
  } catch (error) {
    console.error("Error fetching unique tags from Notion:", error)
    return []
  }
}

export async function getUniqueSubTopics(category) {
  // For subtopics, we'll use the same logic as tags, assuming 'Label' is used for subtopics as well.
  return getUniqueTags(category)
}

// --- Keeping the previous saveNotionPost and getNotionPosts for completeness ---
// These functions are for local caching (posts.json) and are not used by the
// API routes for displaying content anymore, as display is now direct from Notion.
// The webhook still uses saveNotionPost if you want to maintain a local cache.

export async function saveNotionPost(notionData) {
  try {
    const postsPath = path.join(process.cwd(), "lib", "posts.json")

    let existingPosts = []
    if (fs.existsSync(postsPath)) {
      const fileContent = fs.readFileSync(postsPath, "utf8")
      existingPosts = JSON.parse(fileContent)
    }

    const existingIndex = existingPosts.findIndex((post) => post.notion_id === notionData.id)

    const postData = {
      id: existingIndex >= 0 ? existingPosts[existingIndex].id : Date.now().toString(),
      notion_id: notionData.id,
      title: notionData.title,
      slug: generateSlug(notionData.title),
      content: `<p>This post was synced from Notion.</p><p><strong>Platform:</strong> ${notionData.platform}</p><p><strong>Content Type:</strong> ${notionData.contentType}</p>`,
      excerpt: notionData.title.substring(0, 150) + "...",
      category: notionData.pageCategory,
      featured_image: notionData.photoUrl || "/placeholder.svg?height=400&width=600",
      tags: [notionData.platform, notionData.contentType, notionData.status].filter(Boolean),
      status: "published",
      author: notionData.owner || "Yilung C",
      created_at: notionData.createdTime,
      updated_at: notionData.lastEditedTime,
      notion_url: notionData.publicUrl,
      original_post_url: notionData.postUrl,
      page_category: notionData.pageCategory,
      last_synced: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      existingPosts[existingIndex] = { ...existingPosts[existingIndex], ...postData }
    } else {
      existingPosts.push(postData)
    }

    fs.writeFileSync(postsPath, JSON.stringify(existingPosts, null, 2))

    return postData
  } catch (error) {
    console.error("Error saving Notion post:", error)
    throw error
  }
}

export async function getNotionPosts(category = null) {
  try {
    const postsPath = path.join(process.cwd(), "lib", "posts.json")

    if (!fs.existsSync(postsPath)) {
      return []
    }

    const fileContent = fs.readFileSync(postsPath, "utf8")
    const posts = JSON.parse(fileContent)

    if (category) {
      return posts.filter((post) => post.page_category === category)
    }

    return posts
  } catch (error) {
    console.error("Error reading Notion posts:", error)
    return []
  }
}
