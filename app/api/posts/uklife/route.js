import { NextResponse } from "next/server"
import { Notion } from "../../../../lib/notion"
import { getPostsByCategory, getUniqueSubTopics } from "../../../../lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 50
    const source = searchParams.get("source") || "notion" 

    let posts = []
    let uniqueSubTopics = []

    if (source === "db") {
      posts = await getPostsByCategory("uklife", limit)
      uniqueSubTopics = await getUniqueSubTopics("uklife")
    } else {
      const response = await Notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        filter: {
          and: [
            {
              property: "Status",
              select: {
                equals: "Ready for publish"
              }
            },
            {
              or: [
                {
                  property: "Category",
                  select: {
                    equals: "英國生活" 
                  }
                },
                {
                  property: "英國房產", 
                  select: {
                    is_not_empty: true
                  }
                }
              ]
            }
          ]
        },
        sorts: [
          {
            property: "Post date published",
            direction: "descending"
          }
        ],
        page_size: limit
      })

      posts = response.results.map(page => {
        const properties = page.properties
        
        return {
          id: page.id,
          title: properties.Title?.title?.[0]?.plain_text || 
                 properties.Name?.title?.[0]?.plain_text || "Untitled",
          slug: generateSlug(properties.Title?.title?.[0]?.plain_text || 
                            properties.Name?.title?.[0]?.plain_text || "untitled"),
          content: properties.Content?.rich_text?.[0]?.plain_text || "",
          excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || 
                   truncateContent(properties.Content?.rich_text?.[0]?.plain_text || "", 150),
          published_at: properties["Post date published"]?.date?.start || 
                        properties["Created time"]?.created_time || 
                        page.created_time,
          created_at: page.created_time,
          updated_at: page.last_edited_time,
          tags: properties.Tags?.multi_select?.map(tag => tag.name) || 
                properties["標籤"]?.multi_select?.map(tag => tag.name) || [],
          subTopic: properties["英國房產"]?.select?.name || 
                    properties["Sub Topic"]?.select?.name || "",
          status: properties.Status?.select?.name || "",
          pinned: properties.Pinned?.checkbox || properties["置頂"]?.checkbox || false,
          cover_image: page.cover?.external?.url || page.cover?.file?.url || null,
          platform: properties.Platform?.select?.name || "",
          content_type: properties["Content type"]?.select?.name || "",
          author: properties.Author?.rich_text?.[0]?.plain_text || "Admin",
          category: "uklife",
          reading_time: estimateReadingTime(properties.Content?.rich_text?.[0]?.plain_text || ""),
          notion_id: page.id,
          notion_url: page.url,
          source: "notion"
        }
      })

      uniqueSubTopics = [...new Set(posts.map(post => post.subTopic))].filter(Boolean)
    }

    return NextResponse.json({
      success: true,
      posts: posts,
      uniqueSubTopics: uniqueSubTopics,
      count: posts.length,
      category: "uklife",
      source: source,
      total: posts.length
    })

  } catch (error) {
    console.error("Error fetching UK life posts:", error)
    
    if (source === "notion") {
      try {
        console.log("Notion failed, falling back to database...")
        const posts = await getPostsByCategory("uklife", limit)
        const uniqueSubTopics = await getUniqueSubTopics("uklife")
        
        return NextResponse.json({
          success: true,
          posts: posts,
          uniqueSubTopics: uniqueSubTopics,
          count: posts.length,
          category: "uklife",
          source: "db_fallback",
          warning: "Fell back to database due to Notion error"
        })
      } catch (dbError) {
        console.error("Database fallback also failed:", dbError)
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch UK life posts",
        details: error.message 
      },
      { status: 500 }
    )
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function truncateContent(content, maxLength) {
  if (!content || content.length <= maxLength) return content
  return content.substring(0, maxLength).trim() + "..."
}

function estimateReadingTime(content) {
  if (!content) return 1
  const wordCount = content.split(/\s+/).length
  const minutes = Math.ceil(wordCount / 200)
  return minutes
}