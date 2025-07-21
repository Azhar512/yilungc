import { NextResponse } from "next/server"

export async function GET() {
  let postsCache = {
    "book-reviews": [],
    uklife: [],
    lastUpdated: null,
  }

  try {
    const webhookModule = await import("../../webhook/make-posts/route.js")
    postsCache = webhookModule.postsCache
  } catch (e) {
    console.log("Could not import cache")
  }

  return NextResponse.json({
    success: true,
    cache: postsCache,
    info: {
      lastUpdated: postsCache.lastUpdated,
      counts: {
        "book-reviews": postsCache["book-reviews"].length,
        uklife: postsCache["uklife"].length,
      },
    },
    instructions: {
      webhook_url: "/api/webhook/make-posts",
      test_endpoints: ["/api/posts/book-reviews", "/api/posts/uklife"],
    },
    timestamp: new Date().toISOString(),
  })
}
