import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPostBySlug } from "../../../lib/db"
import { formatDate, calculateReadingTime } from "../../../lib/utils"
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react"

export async function generateMetadata({ params }) {
  try {
    const post = await getPostBySlug(params.slug)

    return {
      title: `${post.title} - UK Life | yilungc`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: [post.featured_image],
      },
    }
  } catch (error) {
    return {
      title: "UK Life Story Not Found | yilungc",
    }
  }
}

export default async function LifeBlogPost({ params }) {
  try {
    const post = await getPostBySlug(params.slug)

    return (
      <article className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          <Image
            src={post.featured_image || "/placeholder.svg?height=500&width=1200"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/uklife"
                className="inline-flex items-center space-x-2 text-background/80 hover:text-background mb-4 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to UK Life</span>
              </Link>

              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-secondary/80 text-primary-foreground text-sm font-medium rounded-full backdrop-blur-sm">
                  UK Life
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-background mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center space-x-6 text-background/90">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{calculateReadingTime(post.content)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-xl text-muted-foreground mb-8 font-medium leading-relaxed">{post.excerpt}</div>

              <div
                className="prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-secondary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full hover:bg-secondary/20 transition-colors duration-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-border">
              <Link
                href="/uklife"
                className="inline-flex items-center space-x-2 text-secondary hover:text-primary font-medium group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span>Back to all UK life stories</span>
              </Link>
            </div>
          </div>
        </section>
      </article>
    )
  } catch (error) {
    notFound()
  }
}
