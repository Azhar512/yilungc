import Link from "next/link"
import { Button } from "../components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <h1 className="text-5xl font-bold mb-6 text-center">Welcome to Your Notion Blog</h1>
      <p className="text-xl text-center mb-8 max-w-2xl">
        This site dynamically displays content synced from your Notion database via Make.com webhooks.
      </p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/book-reviews">View Book Reviews</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/uklife">View UK Life Posts</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/notion-dashboard">Integration Dashboard</Link>
        </Button>
      </div>
      <footer className="absolute bottom-4 text-sm text-gray-500">Powered by Next.js, Notion, and Make.com</footer>
    </div>
  )
}
