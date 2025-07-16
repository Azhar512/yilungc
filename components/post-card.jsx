import Link from "next/link"
import Image from "next/image"
import { formatDate, calculateReadingTime } from "../lib/utils"
import { Calendar, Clock, ArrowRight, Pin } from "lucide-react"

export default function PostCard({ post, featured = false }) {
  const cardClasses = featured
    ? "group bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-border hover:border-primary transform hover:-translate-y-2"
    : "group bg-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border hover:border-primary transform hover:-translate-y-1"

  return (
    <article className={cardClasses}>
      <Link href={`/${post.category === "life-blog" ? "uklife" : post.category}/${post.slug}`}>
        <div className="relative overflow-hidden">
          <Image
            src={post.featured_image || "/placeholder.svg?height=300&width=500"}
            alt={post.title}
            width={featured ? 600 : 400}
            height={featured ? 400 : 250}
            className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium text-primary-foreground backdrop-blur-sm ${
                post.category === "book-reviews" ? "bg-accent/80" : "bg-secondary/80"
              }`}
            >
              {post.category === "book-reviews" ? "Book Review" : "UK Life"}
            </span>
          </div>

          {/* Pinned Indicator */}
          {post.pinned && (
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
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{calculateReadingTime(post.content)}</span>
            </div>
          </div>

          <h3
            className={`font-serif font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 ${
              featured ? "text-xl md:text-2xl mb-3" : "text-lg mb-2"
            }`}
          >
            {post.title}
          </h3>

          <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
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
