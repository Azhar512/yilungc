import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request) {
  try {
    const body = await request.json()
    console.log("Received Notion webhook data:", body)

    // Extract the page ID from the webhook data
    const pageId = body.id
    const title = extractNotionText(body.properties?.["Aa Post name"])
    const label = extractNotionSelect(body.properties?.["Label"])
    const status = extractNotionSelect(body.properties?.["Status"])

    console.log(`Notion page updated: ${title} (${pageId})`)
    console.log(`Label: ${label}, Status: ${status}`)

    // Determine which pages need to be revalidated based on the label
    const categoriesToRevalidate = determineCategoriesFromLabel(label, status)

    // Revalidate the relevant pages so they fetch fresh data
    for (const category of categoriesToRevalidate) {
      if (category === "book-reviews") {
        revalidatePath("/book-reviews")
        revalidatePath("/api/posts/book-reviews")
      } else if (category === "uklife") {
        revalidatePath("/uklife")
        revalidatePath("/api/posts/uklife")
      }
      console.log(`Revalidated paths for: ${category}`)
    }

    return NextResponse.json({
      success: true,
      message: `Webhook processed for: ${title}`,
      pageId: pageId,
      categoriesRevalidated: categoriesToRevalidate,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Notion sync webhook error:", error)
    return NextResponse.json(
      {
        error: "Failed to process Notion webhook",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Notion Sync Webhook Endpoint",
    status: "Active",
    endpoint: "/api/webhook/notion-sync",
    method: "POST",
    description: "Receives webhooks from Make.com when Notion database items are updated",
    note: "This triggers revalidation of your existing Notion-based pages",
  })
}

// Helper functions to extract Notion data (matching your existing structure)
function extractNotionText(property) {
  if (!property) return ""
  if (property.title) return property.title[0]?.plain_text || ""
  if (property.rich_text) return property.rich_text[0]?.plain_text || ""
  return ""
}

function extractNotionSelect(property) {
  return property?.select?.name || ""
}

function determineCategoriesFromLabel(label, status) {
  const categories = []

  // Use your existing label mapping logic from lib/db.js
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

  if (bookReviewLabels.includes(label) || status.toLowerCase() === "book") {
    categories.push("book-reviews")
  }

  if (ukLifeLabels.includes(label) || status.toLowerCase() === "life") {
    categories.push("uklife")
  }

  // If no specific match, determine based on status
  if (categories.length === 0) {
    if (status.toLowerCase().includes("ready")) {
      categories.push("uklife") // Default fallback
    }
  }

  return categories
}
