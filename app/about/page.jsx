import Image from "next/image"
import Link from "next/link"
import { Mail, Github, Instagram, Facebook, XIcon, Linkedin, BookOpen, Heart, Coffee, MapPin } from "lucide-react"

export const metadata = {
  title: "About Me - yilungc",
  description:
    "Learn more about Yilung C, my passion for books, and my journey through life. Connect with me on social media.",
}

export default function AboutPage() {
  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/MyLittleLovelyRosaIG", icon: Facebook, color: "text-blue-600" },
    { name: "Instagram", href: "https://www.instagram.com/dr_yi_lung/", icon: Instagram, color: "text-pink-600" },
    { name: "X", href: "#", icon: XIcon, color: "text-gray-800" }, // Placeholder for X (Twitter)
    { name: "GitHub", href: "#", icon: Github, color: "text-foreground" }, // Placeholder
    { name: "LinkedIn", href: "#", icon: Linkedin, color: "text-blue-700" }, // Placeholder
    { name: "Email", href: "mailto:hello@yilungc.com", icon: Mail, color: "text-primary" },
  ]

  const stats = [
    { label: "Books Read", value: "150+", icon: BookOpen },
    { label: "Blog Posts", value: "50+", icon: Heart },
    { label: "Coffee Cups", value: "∞", icon: Coffee },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground py-20">
        <div className="absolute inset-0 bg-foreground/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="mb-8">
              <Image
                src="/placeholder.svg?height=150&width=150"
                alt="Profile Picture"
                width={150}
                height={150}
                className="rounded-full mx-auto border-4 border-background/20 shadow-2xl"
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Hi, I'm <span className="text-accent-foreground">Yilung C</span>
            </h1>

            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              A passionate reader, storyteller, and life enthusiast sharing my journey through books and experiences.
            </p>

            <div className="flex items-center justify-center space-x-2 text-primary-foreground/80 mb-8">
              <MapPin className="w-5 h-5" />
              <span>Based in Your City, Country</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="text-center p-6 bg-gradient-to-br from-muted to-background rounded-2xl animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-6">My Story</h2>
              <div className="prose prose-lg text-muted-foreground space-y-4">
                <p>
                  Welcome to my little corner of the internet! I'm a passionate reader and writer who believes that
                  every book has the power to change us, and every life experience has a story worth sharing.
                </p>
                <p>
                  My love for books started early, and over the years, I've discovered that reading isn't just about
                  entertainment—it's about understanding different perspectives, learning from others' experiences, and
                  growing as a person.
                </p>
                <p>
                  Through this blog, I share my thoughts on the books that have impacted me and the life experiences
                  that have shaped my journey. Whether it's a thought-provoking novel or a personal milestone, I believe
                  there's always something valuable to learn and share.
                </p>
              </div>
            </div>

            <div className="animate-fade-in">
              <div className="bg-card p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-6">What I Love</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-accent" />
                    <span className="text-muted-foreground">Reading fiction and non-fiction</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-6 h-6 text-secondary" />
                    <span className="text-muted-foreground">Sharing personal experiences</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Coffee className="w-6 h-6 text-primary" />
                    <span className="text-muted-foreground">Coffee and cozy reading nooks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6 animate-fade-in">Let's Connect</h2>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
            I'd love to hear from you! Whether you want to discuss a book, share your own story, or just say hello, feel
            free to reach out.
          </p>

          <div className="flex justify-center space-x-6 animate-slide-up">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`p-4 bg-muted rounded-full hover:bg-muted-foreground/10 transition-all duration-300 transform hover:scale-110 ${social.color}`}
                  aria-label={social.name}
                >
                  <Icon className="w-6 h-6" />
                </Link>
              )
            })}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-primary to-secondary rounded-2xl text-primary-foreground animate-bounce-in">
            <h3 className="text-2xl font-serif font-bold mb-4">Want to collaborate?</h3>
            <p className="text-primary-foreground/90 mb-6">
              I'm always open to book recommendations, guest posts, or just a friendly chat about life and literature.
            </p>
            <Link
              href="mailto:hello@yilungc.com"
              className="inline-flex items-center space-x-2 bg-primary-foreground text-primary px-6 py-3 rounded-full font-semibold hover:bg-muted transition-all duration-300 transform hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              <span>Get in Touch</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
