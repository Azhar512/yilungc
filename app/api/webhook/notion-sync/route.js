import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(req) {
  try {
    const body = await req.json()
    console.log("Notion sync webhook received:", body)

    // Revalidate the pages to fetch fresh data from cache
    revalidatePath("/book-reviews")
    revalidatePath("/uklife")
    revalidatePath("/api/posts/book-reviews")
    revalidatePath("/api/posts/uklife")

    return NextResponse.json(
      {
        message: "Cache invalidated successfully - Make.com will update data",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      {
        message: "Webhook processing failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
