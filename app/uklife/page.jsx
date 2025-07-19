import UKLifeClientPage from "./UKLifeClientPage"
import { getPostsByCategory, getUniqueSubTopics } from "../../lib/db"

export const revalidate = 300 // Revalidate every 5 minutes

export default async function UKLifePage() {
  const initialPosts = await getPostsByCategory("uklife")
  const initialUniqueSubTopics = await getUniqueSubTopics("uklife")

  return <UKLifeClientPage initialPosts={initialPosts} initialUniqueSubTopics={initialUniqueSubTopics} />
}
