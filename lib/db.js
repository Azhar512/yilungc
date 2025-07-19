// Import necessary functions
import { Notion } from "./notion" // Assuming lib/notion.js is correctly set up
import { generateSlug } from "./utils" // Ensure generateSlug is imported from utils

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID

// Helper to map Notion page properties to your desired post format
function mapNotionPageToPost(page) {
  const properties = page.properties

  // Helper to safely get property values
  const getTitle = (prop) => prop?.title?.[0]?.plain_text || ""
  const getRichText = (prop) => prop?.rich_text?.[0]?.plain_text || ""
  const getSelect = (prop) => prop?.select?.name || ""
  const getMultiSelect = (prop) => prop?.multi_select?.map((item) => item.name) || []
  const getUrl = (prop) => prop?.url || ""
  const getFiles = (prop) => {
    if (prop && prop.files && prop.files.length > 0) {
      const firstFile = prop.files[0]
      if (firstFile.file && firstFile.file.url) {
        return firstFile.file.url
      }
      if (firstFile.external && firstFile.external.url) {
        return firstFile.external.url
      }
    }
    // Always return a default placeholder if no valid URL is found
    return "/placeholder.png?height=400&width=600"
  }
  const getCheckbox = (prop) => prop?.checkbox || false
  const getDate = (prop) => prop?.date?.start || ""
  // New helper for status property
  const getStatus = (prop) => prop?.status?.name || ""

  const title = getTitle(properties["Aa Post name"])
  const status = getStatus(properties["Status"]) // Use getStatus for the Status property
  const label = getSelect(properties["Label"]) // This is for the '英國房產' type label
  const otherLifeLabels = getMultiSelect(properties["人生其他"]) // Multi-select for UK Life categories
  const bookReviewLabels = getMultiSelect(properties["讀書心得"]) // Multi-select for Book Review categories

  const photoUrl = getFiles(properties["Photo URL"]) // Now always a valid URL or placeholder
  const platform = getSelect(properties["Platform"])
  const contentType = getSelect(properties["Content type"])
  const owner = getRichText(properties["Owner"]) // Assuming owner is rich text
  const postUrl = getUrl(properties["Post URL"])
  const pinned = getCheckbox(properties["Pinned"])
  const createdTime = page.created_time
  const lastEditedTime = page.last_edited_time
  const publicUrl = page.public_url || "" // Ensure it's a string

  // Determine category based on your Notion labels/statuses
  let pageCategory = "general"
  const allUkLifeLabels = [
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
  const allBookReviewLabels = [
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

  // Check if any of the '人生其他' labels match UK Life categories
  if (otherLifeLabels.some((l) => allUkLifeLabels.includes(l)) || status.toLowerCase().includes("life")) {
    pageCategory = "uklife"
  }
  // Check if any of the '讀書心得' labels match Book Review categories
  if (bookReviewLabels.some((l) => allBookReviewLabels.includes(l)) || status.toLowerCase().includes("book")) {
    pageCategory = "book-reviews"
  }

  return {
    id: page.id,
    notion_id: page.id,
    title: title,
    slug: generateSlug(title),
    content: `<p>This post was synced from Notion.</p><p><strong>Platform:</strong> ${platform}</p><p><strong>Content Type:</strong> ${contentType}</p>`, // Placeholder, full content needs separate fetch
    excerpt: getRichText(properties["Excerpt"]) || title.substring(0, 150) + "...",
    category: pageCategory, // This will be used for routing
    featured_image: photoUrl, // Now always a valid URL or placeholder
    tags: [platform, contentType, status, label, ...otherLifeLabels, ...bookReviewLabels].filter(Boolean), // Include all relevant labels in tags
    status: status,
    author: owner || "Yilung C",
    sub_topic: otherLifeLabels.length > 0 ? otherLifeLabels[0] : label, // Use first otherLifeLabel or main Label
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
    console.error("CRITICAL ERROR: NOTION_DATABASE_ID environment variable is not set.")
    throw new Error("NOTION_DATABASE_ID is not set. Please configure it in Vercel environment variables.")
  }

  let categorySpecificFilter = {}
  // Filter by 'Status' and 'Label' properties to match your Notion setup
  // and ensure posts are "Ready for Publish"
  const commonStatusFilter = {
    property: "Status",
    status: {
      equals: "Ready for publish", // This is a valid status option from your screenshot
    },
  }

  if (category === "book-reviews") {
    categorySpecificFilter = {
      or: [
        {
          property: "讀書心得", // Filter by the multi-select property
          multi_select: {
            contains: "讀書心得",
          },
        },
        {
          property: "讀書心得",
          multi_select: {
            contains: "一人公司",
          },
        },
        {
          property: "讀書心得",
          multi_select: {
            contains: "HerRead",
          },
        },
        {
          property: "讀書心得",
          multi_select: {
            contains: "Book", // Assuming "Book" is also a multi-select option in '讀書心得'
          },
        },
        // Add other specific book review labels if needed
      ],
    }
  } else if (category === "uklife") {
    categorySpecificFilter = {
      or: [
        {
          property: "人生其他", // Filter by the multi-select property
          multi_select: {
            contains: "看房紀錄",
          },
        },
        {
          property: "人生其他",
          multi_select: {
            contains: "居家裝修",
          },
        },
        {
          property: "人生其他",
          multi_select: {
            contains: "房產知識",
          },
        },
        // Add other specific UK life labels if needed
      ],
    }
  }

  const combinedFilter = {
    and: [categorySpecificFilter, commonStatusFilter], // Combine category-specific and common status filters
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
    throw error // Re-throw the error to ensure it propagates and stops the build if critical
  }
}

// Helper to get unique tags/subtopics directly from Notion properties
export async function getUniqueTags(category) {
  if (!NOTION_DATABASE_ID) return []
  try {
    const response = await Notion.databases.retrieve({ database_id: NOTION_DATABASE_ID })
    let options = []
    // Retrieve options from '讀書心得' for book reviews
    if (category === "book-reviews") {
      const bookReviewProperty = response.properties["讀書心得"]
      if (bookReviewProperty && bookReviewProperty.type === "multi_select") {
        options = bookReviewProperty.multi_select.options.map((option) => option.name)
      }
    }
    // Retrieve options from '人生其他' for UK life
    else if (category === "uklife") {
      const ukLifeProperty = response.properties["人生其他"]
      if (ukLifeProperty && ukLifeProperty.type === "multi_select") {
        options = ukLifeProperty.multi_select.options.map((option) => option.name)
      }
    }
    // Also include options from 'Label' if it's used for general tags
    const labelProperty = response.properties["Label"]
    if (labelProperty && labelProperty.type === "select") {
      options = [...options, ...labelProperty.select.options.map((option) => option.name)]
    }

    return [...new Set(options)] // Return unique options
  } catch (error) {
    console.error("Error fetching unique tags from Notion:", error)
    return []
  }
}

export async function getUniqueSubTopics(category) {
  // For subtopics, we'll use the same logic as tags, assuming '人生其他' is used for subtopics.
  return getUniqueTags(category)
}

export async function getPostBySlug(category, slug) {
  if (!NOTION_DATABASE_ID) {
    console.error("CRITICAL ERROR: NOTION_DATABASE_ID environment variable is not set.")
    throw new Error("NOTION_DATABASE_ID is not set. Please configure it in Vercel environment variables.")
  }

  const commonStatusFilter = {
    property: "Status",
    status: {
      equals: "Ready for publish",
    },
  }

  const slugFilter = {
    property: "Aa Post name", // Assuming 'Aa Post name' is the title property
    title: {
      is_not_empty: true, // We'll filter by slug derived from title
    },
  }

  let categorySpecificFilter = {}
  if (category === "book-reviews") {
    categorySpecificFilter = {
      or: [
        { property: "讀書心得", multi_select: { contains: "讀書心得" } },
        { property: "讀書心得", multi_select: { contains: "Book" } },
      ],
    }
  } else if (category === "uklife") {
    categorySpecificFilter = {
      or: [
        { property: "人生其他", multi_select: { contains: "看房紀錄" } },
        { property: "人生其他", multi_select: { contains: "居家裝修" } },
        { property: "人生其他", multi_select: { contains: "房產知識" } },
      ],
    }
  }

  const combinedFilter = {
    and: [
      commonStatusFilter,
      slugFilter, // This filter is broad, we'll refine by slug after fetching
      categorySpecificFilter,
    ],
  }

  try {
    const response = await Notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: combinedFilter,
      page_size: 100, // Fetch enough to find the slug
    })

    const posts = response.results.map(mapNotionPageToPost)
    // Filter by generated slug after mapping
    return posts.find((p) => p.slug === slug)
  } catch (error) {
    console.error(`Error fetching post by slug (${slug}) for category ${category}:`, error)
    throw error
  }
}
