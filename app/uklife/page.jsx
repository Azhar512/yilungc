import UKLifeClientPage from "./UKLifeClientPage"
import { getPostsByCategory, getUniqueSubTopics } from "../../lib/db" // Import getUniqueSubTopics

export const metadata = {
  title: "UK Life - yilungc",
  description: "Explore different aspects of UK life, from travel and culture to practical living and personal growth.",
}

export default async function UKLifePage() {
  const posts = await getPostsByCategory("life-blog", 50)
  const uniqueSubTopics = await getUniqueSubTopics("life-blog") // Fetch unique sub-topics on the server

  return <UKLifeClientPage initialPosts={posts} initialUniqueSubTopics={uniqueSubTopics} />
}
