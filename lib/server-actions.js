import fs from "fs"
import path from "path"
import { generateSlug } from "./utils" 



export async function saveNotionPost(notionData) {
  try {
    const postsPath = path.join(process.cwd(), "lib", "posts.json")

    let existingPosts = []
    if (fs.existsSync(postsPath)) {
      const fileContent = fs.readFileSync(postsPath, "utf8")
      existingPosts = JSON.parse(fileContent)
    }

    const existingIndex = existingPosts.findIndex((post) => post.notion_id === notionData.id)

    const postData = {
      id: existingIndex >= 0 ? existingPosts[existingIndex].id : Date.now().toString(),
      notion_id: notionData.id,
      title: notionData.title,
      slug: generateSlug(notionData.title),
      content: `<p>This post was synced from Notion.</p><p><strong>Platform:</strong> ${notionData.platform}</p><p><strong>Content Type:</strong> ${notionData.contentType}</p>`,
      excerpt: notionData.excerpt || notionData.title.substring(0, 150) + "...", 
      category: notionData.pageCategory,
      featured_image: notionData.photoUrl || "/placeholder.png?height=400&width=600",
      tags: [
        notionData.platform,
        notionData.contentType,
        notionData.status,
        notionData.label,
        ...notionData.otherLifeLabels,
        ...notionData.bookReviewLabels,
      ].filter(Boolean), 
      status: notionData.status,
      author: notionData.owner || "Yilung C",
      sub_topic: notionData.otherLifeLabels.length > 0 ? notionData.otherLifeLabels[0] : notionData.label, 
      pinned: notionData.pinned,
      created_at: notionData.createdTime,
      updated_at: notionData.lastEditedTime,
      published_at: notionData.newPostDate || notionData.createdTime, 
      notion_url: notionData.publicUrl,
      original_post_url: notionData.postUrl,
      page_category: notionData.pageCategory,
      last_synced: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      existingPosts[existingIndex] = { ...existingPosts[existingIndex], ...postData }
    } else {
      existingPosts.push(postData)
    }

    fs.writeFileSync(postsPath, JSON.stringify(existingPosts, null, 2))

    return postData
  } catch (error) {
    console.error("Error saving Notion post:", error)
    throw error
  }
}

export async function getNotionPosts(category = null) {
  try {
    const postsPath = path.join(process.cwd(), "lib", "posts.json")

    if (!fs.existsSync(postsPath)) {
      return []
    }

    const fileContent = fs.readFileSync(postsPath, "utf8")
    const posts = JSON.parse(fileContent)

    if (category) {
      return posts.filter((post) => post.page_category === category)
    }

    return posts
  } catch (error) {
    console.error("Error reading Notion posts:", error)
    return []
  }
}
