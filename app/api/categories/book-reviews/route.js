import { getUniqueTags } from "/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const tags = await getUniqueTags("book-reviews")
    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching Book Review tags:", error)
    return NextResponse.json({ error: "Failed to fetch Book Review tags" }, { status: 500 })
  }
}
