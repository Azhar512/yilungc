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
            status: {  // Changed from 'select' to 'status'
              equals: "Ready for publish"
            }
          },
          {
            or: [
              {
                property: "讀書心得",
                multi_select: {
                  contains: "讀書心得"
                }
              },
              {
                property: "讀書心得",
                multi_select: {
                  contains: "一人公司"
                }
              },
              {
                property: "讀書心得",
                multi_select: {
                  contains: "HerRead"
                }
              }
            ]
          }
        ]
      },
      sorts: [
        {
          property: "New post date", // Use the same property as in your db.js
          direction: "descending"
        }
      ]
    })

    // Transform Notion data to your expected format
    const posts = response.results.map(page => {
      const properties = page.properties
      
      return {
        id: page.id,
        title: properties["Aa Post name"]?.title?.[0]?.plain_text || "Untitled",
        slug: generateSlug(properties["Aa Post name"]?.title?.[0]?.plain_text || "untitled"),
        content: properties.Content?.rich_text?.[0]?.plain_text || "",
        published_at: properties["New post date"]?.date?.start || page.created_time,
        created_at: page.created_time,
        tags: [
          ...(properties["讀書心得"]?.multi_select?.map(tag => tag.name) || []),
          ...(properties.Label?.select?.name ? [properties.Label.select.name] : []),
          ...(properties.Platform?.select?.name ? [properties.Platform.select.name] : [])
        ],
        status: properties.Status?.status?.name || "",
        pinned: properties.Pinned?.checkbox || false,
        cover_image: properties["Photo URL"]?.files?.[0]?.file?.url || 
                     properties["Photo URL"]?.files?.[0]?.external?.url || 
                     page.cover?.external?.url || 
                     page.cover?.file?.url || null,
        author: properties.Owner?.rich_text?.[0]?.plain_text || "Yilung C",
        platform: properties.Platform?.select?.name || "",
        content_type: properties["Content type"]?.select?.name || "",
        original_post_url: properties["Post URL"]?.url || "",
        excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || "",
        // Add any other properties you need
      }
    })

    // Extract unique tags from the book review multi-select property
    const uniqueTags = [
      ...new Set(
        posts.flatMap(post => 
          post.tags.filter(tag => 
            // Filter for book review related tags
            ["讀書心得", "一人公司", "HerRead", "Taiwan and Transitional Justice", 
             "Parenting", "Business and Startups", "Life and Finance", 
             "Science Fiction", "Philosophy", "Fiction", "Classic", 
             "Contemporary", "Humor", "Adventure", "Reading List", "Poems", "Book"]
            .includes(tag)
          )
        )
      )
    ].filter(Boolean)

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