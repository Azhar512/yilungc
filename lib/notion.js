import { Client } from "@notionhq/client"

const NOTION_API_KEY = process.env.NOTION_API_KEY

let notionClient = null

if (!NOTION_API_KEY) {
  console.warn(
    "WARNING: NOTION_API_KEY environment variable is not set. Notion integration will not function. Please configure it in Vercel environment variables for full functionality.",
  )
  
  notionClient = {
    databases: {
      query: async () => {
        console.error("Notion client not initialized: NOTION_API_KEY is missing. Returning empty results.")
        return { results: [] }
      },
      retrieve: async () => {
        console.error("Notion client not initialized: NOTION_API_KEY is missing. Returning empty properties.")
        return { properties: {} }
      },
    },
  }
} else {
  notionClient = new Client({
    auth: NOTION_API_KEY,
  })
}

export { notionClient as Notion }
