"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, XIcon, Search } from "lucide-react"
import { usePathname } from "next/navigation"
import { generateSlug } from "../lib/db" // Corrected import path for generateSlug
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import SearchOverlay from "./search-overlay"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false) // State for search overlay
  const [navCategories, setNavCategories] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null) // State to control which dropdown is open
  const pathname = usePathname()
  const isUKLifePage = pathname.startsWith("/uklife")
  const isBookReviewsPage = pathname.startsWith("/book-reviews")
  const isHomePage = pathname === "/"
  // Define the new category structure for the header
  const ukLifeHeaderCategories = [
    {
      name: "Raising kids in London",
      subCategories: [
        { name: "UK private education", slug: "uk-private-education" },
        { name: "Oversea family", slug: "oversea-family" },
        { name: "Being a Mother", slug: "being-a-mother" },
      ],
    },
    {
      name: "Travel with Kids",
      subCategories: [
        { name: "Travel with kids in UK", slug: "travel-with-kids-in-uk" },
        { name: "Travel with kids abroad", slug: "travel-with-kids-abroad" },
        { name: "Travel with kids in Taiwan", slug: "travel-with-kids-in-taiwan" },
      ],
    },
    { name: "London Afternoon Tea", slug: "london-afternoon-tea" }, // Direct link
    {
      name: "London",
      subCategories: [
        { name: "London restaurants", slug: "london-restaurants" },
        { name: "London never gets boring", slug: "london-never-gets-boring" },
      ],
    },
    {
      name: "Personal Thoughts",
      subCategories: [
        { name: "Homepreneur", slug: "homepreneur" },
        { name: "Love hacks", slug: "love-hacks" },
        { name: "Home style", slug: "home-style" },
      ],
    },
  ]
  // For Book Reviews, these are now direct links to sections (tags)
  const bookReviewHeaderCategories = [
    { name: "HerRead", slug: "herread" },
    { name: "Taiwan and Transitional Justice", slug: "taiwan-and-transitional-justice" },
    { name: "Parenting", slug: "parenting" },
    { name: "Business and Startups", slug: "business-and-startups" },
    { name: "Life and Finance", slug: "life-and-finance" },
    { name: "Science and Tech", slug: "science-and-tech" },
    { name: "Novel and Bio", slug: "novel-and-bio" },
    { name: "Reading List", slug: "reading-list" },
  ]
  useEffect(() => {
    if (isUKLifePage) {
      setNavCategories(ukLifeHeaderCategories)
    } else if (isBookReviewsPage) {
      setNavCategories(bookReviewHeaderCategories)
    } else {
      setNavCategories([]) // Clear categories if on homepage
    }
  }, [pathname, isUKLifePage, isBookReviewsPage])
  const baseHref = isUKLifePage ? "/uklife#" : "/book-reviews#"
  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform duration-200">
                <span className="text-primary-foreground font-bold text-sm">YL</span>
              </div>
              <span className="font-serif text-xl font-bold text-foreground">yilungc</span>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {isHomePage ? (
                <Link
                  href="/about"
                  className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-200 group"
                >
                  <span className="font-medium">About Me</span>
                </Link>
              ) : isBookReviewsPage ? (
                // Render direct links for Book Reviews
                navCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`${baseHref}${category.slug}`}
                    className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-200 group"
                  >
                    <span className="font-medium">{category.name}</span>
                  </Link>
                ))
              ) : (
                // Render dropdowns for UK Life
                navCategories.map((category) =>
                  category.subCategories && category.subCategories.length > 0 ? (
                    <DropdownMenu
                      key={category.name}
                      open={openDropdown === category.name}
                      onOpenChange={(isOpen) => setOpenDropdown(isOpen ? category.name : null)}
                    >
                      <DropdownMenuTrigger
                        asChild
                        onMouseEnter={() => setOpenDropdown(category.name)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <button className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-200 group font-medium">
                          {category.name}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-48"
                        onMouseEnter={() => setOpenDropdown(category.name)} // Keep open if mouse re-enters content
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        {category.subCategories.map((subCat) => (
                          <DropdownMenuItem key={subCat.slug} asChild>
                            <Link href={`${baseHref}${subCat.slug}`} onClick={() => setIsMenuOpen(false)}>
                              {subCat.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    // Direct link for single-item categories (e.g., London Afternoon Tea in UK Life)
                    <Link
                      key={category.name}
                      href={`${baseHref}${generateSlug(category.name)}`}
                      className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-200 group"
                    >
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ),
                )
              )}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>
            </nav>
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors duration-200 mr-2"
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50 animate-in slide-in-from-top duration-200 max-h-[50vh] overflow-y-auto">
              <nav className="flex flex-col space-y-2">
                {isHomePage ? (
                  <Link
                    href="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-muted transition-all duration-200"
                  >
                    <span className="font-medium">About Me</span>
                  </Link>
                ) : isBookReviewsPage ? (
                  // Render direct links for Book Reviews in mobile
                  navCategories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`${baseHref}${category.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-muted transition-all duration-200"
                    >
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))
                ) : (
                  // Render dropdowns for UK Life in mobile
                  navCategories.map((category) => (
                    <div key={category.name}>
                      <span className="block px-3 py-2 font-medium text-foreground">{category.name}</span>
                      {category.subCategories && category.subCategories.length > 0 ? (
                        <div className="pl-6 flex flex-col space-y-1">
                          {category.subCategories.map((subCat) => (
                            <Link
                              key={subCat.slug}
                              href={`${baseHref}${subCat.slug}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200 text-sm"
                            >
                              {subCat.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        // Direct link for single-item categories in mobile
                        <Link
                          key={category.slug}
                          href={`${baseHref}${generateSlug(category.name)}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg text-foreground hover:text-primary hover:bg-muted transition-all duration-200"
                        >
                          <span className="font-medium">{category.name}</span>
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
