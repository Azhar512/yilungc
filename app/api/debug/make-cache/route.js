import { NextResponse } from "next/server"
import { postsCache, getCacheInfo } from "../../../lib/posts-cache"

export async function GET() {
  return NextResponse.json({
    success: true,
    cache: postsCache,
    info: getCacheInfo(),
    instructions: {
      webhook_url: "/api/webhook/make-posts",
      test_endpoints: ["/api/posts/book-reviews", "/api/posts/uklife"],
    },
    timestamp: new Date().toISOString(),
  })
}
