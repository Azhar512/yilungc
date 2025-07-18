import { Client } from "@notionhq/client"

const NOTION_API_KEY = process.env.NOTION_API_KEY

if (!NOTION_API_KEY) {
  console.error("CRITICAL ERROR: NOTION_API_KEY environment variable is not set.")
  throw new Error("NOTION_API_KEY is not set. Please configure it in Vercel environment variables.")
}

const notion = new Client({
  auth: NOTION_API_KEY,
})

export { notion as Notion }
