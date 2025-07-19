import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

export function calculateReadingTime(content) {
  if (!content) return "0 min read"
  const wordsPerMinute = 200 // Average reading speed
  const textContent = content.replace(/<[^>]*>/g, "") // Remove HTML tags
  const wordCount = textContent.split(/\s+/).length
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute)
  return `${readingTimeMinutes} min read`
}

export function extractPageId(notionUrl) {
  if (!notionUrl) return null
  // Regex to extract the 32-character ID from a Notion URL
  const match = notionUrl.match(/([a-f0-9]{32})$/)
  if (match && match[1]) {
    return match[1]
  }
  // Fallback for older Notion URLs or if ID is in a different part
  const uuidMatch = notionUrl.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)
  if (uuidMatch && uuidMatch[0]) {
    return uuidMatch[0].replace(/-/g, "") // Remove hyphens for consistency
  }
  return null
}
