import { getPostBySlug } from "../../../lib/db" // Corrected import
import { notFound } from "next/navigation"
import Image from "next/image"
import Header from "../../../components/header"
import { Calendar, User } from "lucide-react"
import { formatDate, calculateReadingTime } from "../../../lib/utils" // Corrected import

export async function generateStaticParams() {
  // This function is still needed for static generation, but it will fetch all relevant slugs
  // For simplicity, we'll fetch all posts and map their slugs.
  // In a very large database, you might need a more optimized approach.
  const { getPostsByCategory } = await import("../../../lib/db")
  const posts = await getPostsByCategory("uklife", 100) // Fetch more posts for static generation
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function UKLifeDetailPage({ params }) {
  const { slug } = params
  const post = await getPostBySlug("uklife", slug) // Use the new getPostBySlug

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background theme-uk-life">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-3xl">
        <article className="prose prose-lg mx-auto">
          {post.featured_image && post.featured_image !== "/placeholder.png?height=400&width=600" && (
            <div className="relative w-full h-64 md:h-80 lg:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.featured_image || "/placeholder.png"}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.published_at)}</span> {/* Use formatDate */}
            </div>
            <div className="flex items-center gap-1">
              <span>{calculateReadingTime(post.content)}</span> {/* Use calculateReadingTime */}
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          {/* You would typically fetch the full Notion page content here using Notion API */}
          <p className="mt-8 text-muted-foreground">
            This is a placeholder for the full post content. You would integrate Notion's block API here to render the
            full page.
          </p>
          {post.notion_url && (
            <p className="mt-4">
              <a
                href={post.notion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View on Notion
              </a>
            </p>
          )}
        </article>
      </main>
    </div>
  )
}
