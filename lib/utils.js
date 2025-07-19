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
