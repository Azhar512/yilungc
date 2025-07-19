import BookReviewsClientPage from "./BookReviewsClientPage"
import { getPostsByCategory, getUniqueTags } from "../../lib/db"

export const revalidate = 300 

export default async function BookReviewsPage() {
  const initialPosts = await getPostsByCategory("book-reviews")
  const initialUniqueTags = await getUniqueTags("book-reviews")

  return <BookReviewsClientPage initialPosts={initialPosts} initialUniqueTags={initialUniqueTags} />
}
