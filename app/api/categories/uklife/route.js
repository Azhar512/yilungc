import { getUniqueSubTopics }  from "/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const subTopics = await getUniqueSubTopics("life-blog")
    return NextResponse.json(subTopics)
  } catch (error) {
    console.error("Error fetching UK Life sub-topics:", error)
    return NextResponse.json({ error: "Failed to fetch UK Life sub-topics" }, { status: 500 })
  }
}
