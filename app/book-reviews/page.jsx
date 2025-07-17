import BookReviewsClientPage from "./BookReviewsClientPage"
import { getPostsByCategory, getUniqueTags } from "../../lib/db" // Import getUniqueTags

export const metadata = {
  title: "Book Reviews - yilungc",
  description:
    "Discover my thoughts on the latest books across various genres. From fiction to non-fiction, find your next great read.",
}

export default async function BookReviewsPage() {
  const posts = await getPostsByCategory("book-reviews", 50)
  const uniqueTags = await getUniqueTags("book-reviews") // Fetch unique tags on the server

  return <BookReviewsClientPage initialPosts={posts} initialUniqueTags={uniqueTags} />
}
