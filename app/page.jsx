import Link from "next/link"
import { BookOpen, Heart, ArrowRight } from "lucide-react"

export const metadata = {
  title: "yilungc - Choose Your Journey",
  description: "Select your preferred blog experience: Book Reviews or UK Life Adventures.",
}

export default function HomePageSelection() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16">
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight text-foreground">
            Welcome to <span className="gradient-text">yilungc</span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose your adventure: Dive into insightful book reviews or explore captivating UK life experiences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Book Reviews Option */}
            <Link
              href="/book-reviews"
              className="group flex flex-col items-center justify-center p-8 bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-border hover:border-accent"
            >
              <div className="p-4 bg-accent/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-3 group-hover:text-accent transition-colors duration-200">
                Book Reviews
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Explore my thoughts on various books, from fiction to non-fiction.
              </p>
              <span className="inline-flex items-center space-x-2 text-accent font-semibold group-hover:text-primary transition-colors duration-200">
                <span>Start Reading</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>

            {/* UK Life Option */}
            <Link
              href="/uklife"
              className="group flex flex-col items-center justify-center p-8 bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-border hover:border-secondary"
            >
              <div className="p-4 bg-secondary/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-12 h-12 text-secondary" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-3 group-hover:text-secondary transition-colors duration-200">
                UK Life
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Discover personal stories, travel experiences, and insights into UK life.
              </p>
              <span className="inline-flex items-center space-x-2 text-secondary font-semibold group-hover:text-primary transition-colors duration-200">
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
