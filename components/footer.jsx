import Link from "next/link"
import { Github, Instagram, Facebook, XIcon, Mail, Heart, Linkedin } from "lucide-react"

export default function Footer() {
  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/MyLittleLovelyRosaIG", icon: Facebook },
    { name: "Instagram", href: "https://www.instagram.com/dr_yi_lung/", icon: Instagram },
    { name: "X", href: "#", icon: XIcon }, 
    { name: "GitHub", href: "#", icon: Github }, 
    { name: "LinkedIn", href: "#", icon: Linkedin }, 
    { name: "Email", href: "mailto:hello@yilungc.com", icon: Mail },
  ]

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">YL</span>
              </div>
              <span className="font-bold text-xl">yilungc</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Sharing thoughts on books, life, and everything in between. Join me on this journey of discovery and
              growth.
            </p>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/book-reviews"
                className="block text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Book Reviews
              </Link>
              <Link
                href="/uklife"
                className="block text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                UK Life
              </Link>
              <Link
                href="/about"
                className="block text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                About Me
              </Link>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Connect</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all duration-200 hover:scale-110"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-muted-foreground/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 yilungc. Made with <Heart className="w-4 h-4 inline text-secondary" /> and lots of coffee.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">Ready for Make.com integration</p>
        </div>
      </div>
    </footer>
  )
}
