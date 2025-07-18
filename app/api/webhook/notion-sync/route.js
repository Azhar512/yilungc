import { Notion } from "../../../../lib/notion"
import { extractPageId } from "../../../../lib/utils"
import { NextResponse } from "next/server"

// Assumes this is how you extract select options from Notion
function extractNotionSelect(property) {
  if (!property || property.type !== "select") {
    return null
  }
  return property.select?.name || null
}

export async function POST(req) {
  try {
    const body = await req.json()

    // Check if the event is a page update
    if (body.object !== "page") {
      return NextResponse.json({ message: "Not a page update" }, { status: 200 })
    }

    const pageId = extractPageId(body.url)
    if (!pageId) {
      return NextResponse.json({ message: "Invalid page ID" }, { status: 400 })
    }

    // Extract properties from the Notion webhook payload
    const status = body.properties?.["Status"]?.select?.name
    const category = body.properties?.["Category"]?.select?.name
    const label = extractNotionSelect(body.properties?.["英國房產"]) // Use the actual Notion column name
    const isPublished = body.properties?.["發佈"]?.checkbox || false

    // Define arrays for different categories
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
      // Add your Notion labels here:
      "看房紀錄", // Added from your screenshot
      "居家裝修", // Added from your screenshot
      "房產知識", // Added from your screenshot
      // Add any other specific Chinese labels you use for UK Life posts
    ]

    const investmentLabels = ["房地產投資", "海外房產", "被動收入"]

    // Determine the category based on the label
    let calculatedCategory = category // Default to the existing category

    if (ukLifeLabels.includes(label)) {
      calculatedCategory = "英國生活"
    } else if (investmentLabels.includes(label)) {
      calculatedCategory = "房地產投資"
    }

    // Update the page in Notion if necessary
    if (status === "發佈" && isPublished && (ukLifeLabels.includes(label) || investmentLabels.includes(label))) {
      try {
        await Notion.pages.update({
          page_id: pageId,
          properties: {
            Category: {
              select: {
                name: calculatedCategory,
              },
            },
          },
        })

        return NextResponse.json({ message: "Page category updated successfully" }, { status: 200 })
      } catch (error) {
        console.error("Error updating page:", error)
        return NextResponse.json({ message: "Failed to update page" }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "No update needed or conditions not met" }, { status: 200 })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 })
  }
}
