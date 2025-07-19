import Link from "next/link"
import Image from "next/image"
import { formatDate, calculateReadingTime } from "../lib/utils"
import { Calendar, Clock, ArrowRight, Pin } from "lucide-react"

export default function PostCard({ post, featured = false }) {
  // Safely handle the data with proper fallbacks
  const safePost = {
    id: post?.id || '',
    title: post?.title || 'Untitled',
    slug: post?.slug || '',
    category: post?.category || 'uncategorized',
    featured_image: post?.featured_image || null,
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    published_at: post?.published_at || post?.publishedAt || new Date().toISOString(),
    tags: Array.isArray(post?.tags) ? post.tags : [],
    pinned: Boolean(post?.pinned)
  }

  // Safe date formatting with error handling
  const formatDateSafely = (dateString) => {
    try {
      if (!dateString) return 'No date'
      return formatDate(dateString)
    } catch (error) {
      console.warn('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  // Safe reading time calculation with error handling
  const calculateReadingTimeSafely = (content) => {
    try {
      if (!content) return '0 min read'
      return calculateReadingTime(content)
    } catch (error) {
      console.warn('Reading time calculation error:', error)
      return '~ min read'
    }
  }

  const cardClasses = featured
    ? "group bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-border hover:border-primary transform hover:-translate-y-2"
    : "group bg-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border hover:border-primary transform hover:-translate-y-1"

  // Generate the correct link path
  const linkPath = safePost.category === "life-blog" 
    ? `/uklife/${safePost.slug}` 
    : `/${safePost.category}/${safePost.slug}`

  return (
    <article className={cardClasses}>
      <Link href={linkPath}>
        <div className="relative overflow-hidden">
          <Image
            src={safePost.featured_image || "/placeholder.svg?height=300&width=500"}
            alt={safePost.title}
            width={featured ? 600 : 400}
            height={featured ? 400 : 250}
            className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            priority={featured}
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=300&width=500"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium text-primary-foreground backdrop-blur-sm ${
                safePost.category === "book-reviews" ? "bg-accent/80" : "bg-secondary/80"
              }`}
            >
              {safePost.category === "book-reviews" ? "Book Review" : "UK Life"}
            </span>
          </div>

          {/* Pinned Indicator */}
          {safePost.pinned && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium text-primary-foreground bg-primary/80 backdrop-blur-sm flex items-center space-x-1">
                <Pin className="w-3 h-3" />
                <span>Pinned</span>
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDateSafely(safePost.published_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{calculateReadingTimeSafely(safePost.content)}</span>
            </div>
          </div>

          <h3
            className={`font-serif font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 ${
              featured ? "text-xl md:text-2xl mb-3" : "text-lg mb-2"
            }`}
          >
            {safePost.title}
          </h3>

          <p className="text-muted-foreground line-clamp-3 mb-4">{safePost.excerpt}</p>

          {/* Tags */}
          {safePost.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {safePost.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center text-primary font-medium group-hover:text-secondary transition-colors duration-200">
            <span className="mr-2">Read more</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </Link>
    </article>
  )
}