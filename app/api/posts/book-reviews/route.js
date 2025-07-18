import { NextResponse } from "next/server"
import { Notion } from "../../../../lib/notion"

export async function GET() {
  try {
    // Query your Notion database
    const response = await Notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Status",
            select: {
              equals: "Ready for publish" // or whatever status indicates published
            }
          },
          {
            property: "Category", // Adjust based on your actual property name
            select: {
              equals: "Book Reviews" // or your equivalent category
            }
          }
        ]
      },
      sorts: [
        {
          property: "Created time",
          direction: "descending"
        }
      ]
    })

    // Transform Notion data to your expected format
    const posts = response.results.map(page => {
      const properties = page.properties
      
      return {
        id: page.id,
        title: properties.Title?.title?.[0]?.plain_text || "Untitled",
        slug: generateSlug(properties.Title?.title?.[0]?.plain_text || "untitled"),
        content: properties.Content?.rich_text?.[0]?.plain_text || "",
        published_at: properties["Post date published"]?.date?.start || page.created_time,
        created_at: page.created_time,
        tags: properties.Tags?.multi_select?.map(tag => tag.name) || [],
        status: properties.Status?.select?.name || "",
        pinned: properties.Pinned?.checkbox || false,
        cover_image: page.cover?.external?.url || page.cover?.file?.url || null,
        // Add any other properties you need
      }
    })

    // Extract unique tags
    const uniqueTags = [...new Set(posts.flatMap(post => post.tags))].filter(Boolean)

    return NextResponse.json({
      success: true,
      posts,
      uniqueTags,
      total: posts.length
    })

  } catch (error) {
    console.error("Error fetching book reviews:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch posts",
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Helper function to generate slug (you might already have this in utils)
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}