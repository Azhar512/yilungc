import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { saveNotionPost } from "../../../lib/server-actions" // Corrected import path

export async function POST(request) {
  try {
    // Get the data from Make.com
    const notionData = await request.json()

    console.log("Received Notion data:", notionData)

    // Process the data (you can save to database, etc.)
    // This structure should match what Make.com sends from Notion's properties
    const processedData = {
      id: notionData.id,
      title: notionData.properties?.["Aa Post name"]?.title?.[0]?.plain_text || "Untitled",
      status: notionData.properties?.Status?.status?.name || "Unknown", // Corrected to status type
      label: notionData.properties?.Label?.select?.name || "", // For the single select 'Label'
      otherLifeLabels: notionData.properties?.["人生其他"]?.multi_select?.map((item) => item.name) || [], // For multi-select '人生其他'
      bookReviewLabels: notionData.properties?.["讀書心得"]?.multi_select?.map((item) => item.name) || [], // For multi-select '讀書心得'
      url: notionData.properties?.["Post URL"]?.url || "",
      photoUrl:
        notionData.properties?.["Photo URL"]?.files?.[0]?.file?.url ||
        notionData.properties?.["Photo URL"]?.files?.[0]?.external?.url ||
        "/placeholder.png?height=400&width=600", // Robust image URL
      platform: notionData.properties?.Platform?.select?.name || "",
      contentType: notionData.properties?.["Content type"]?.select?.name || "",
      owner: notionData.properties?.Owner?.rich_text?.[0]?.plain_text || "",
      pinned: notionData.properties?.Pinned?.checkbox || false,
      createdTime: notionData.created_time,
      lastEditedTime: notionData.last_edited_time,
      publicUrl: notionData.public_url || "",
      excerpt: notionData.properties?.Excerpt?.rich_text?.[0]?.plain_text || "",
      newPostDate: notionData.properties?.["New post date"]?.date?.start || "",
    }

    // Determine pageCategory based on the received data, similar to lib/db.js
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
      "Book",
    ]

    if (
      processedData.otherLifeLabels.some((l) => allUkLifeLabels.includes(l)) ||
      processedData.status.toLowerCase().includes("life")
    ) {
      pageCategory = "uklife"
    }
    if (
      processedData.bookReviewLabels.some((l) => allBookReviewLabels.includes(l)) ||
      processedData.status.toLowerCase().includes("book")
    ) {
      pageCategory = "book-reviews"
    }
    processedData.pageCategory = pageCategory // Add determined category to processed data

    // Here you could save to your database or local cache
    // If you want to save to the local posts.json, uncomment the line below
    await saveNotionPost(processedData)

    // Revalidate paths based on the updated post's status or label
    // This logic should match the filtering in lib/db.js
    if (processedData.status === "Ready for publish") {
      revalidatePath("/book-reviews")
      revalidatePath("/uklife")
      revalidatePath("/api/posts/book-reviews")
      revalidatePath("/api/posts/uklife")
      console.log("Revalidated /book-reviews and /uklife due to 'Ready for publish' status.")
    } else if (processedData.bookReviewLabels.some((l) => allBookReviewLabels.includes(l))) {
      revalidatePath("/book-reviews")
      revalidatePath("/api/posts/book-reviews")
      console.log("Revalidated /book-reviews due to book-related label.")
    } else if (processedData.otherLifeLabels.some((l) => allUkLifeLabels.includes(l))) {
      revalidatePath("/uklife")
      revalidatePath("/api/posts/uklife")
      console.log("Revalidated /uklife due to UK life-related label.")
    }

    return NextResponse.json({
      success: true,
      message: "Data received and processed successfully",
      data: processedData,
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process data", details: error.message },
      { status: 500 },
    )
  }
}

// Handle CORS for Make.com
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
