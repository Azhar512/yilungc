import { Inter, Playfair_Display } from "next/font/google" // Import Playfair_Display for serif headings
import Header from "../components/header"
import Footer from "../components/footer"
import "./globals.css" // This line is crucial

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display" })

export const metadata = {
  title: "yilungc - Book Reviews & UK Life Adventures",
  description:
    "A personal blog by Yilung C featuring book reviews and UK life experiences. Join me on this journey of discovery and growth.",
  keywords: "blog, book reviews, uk life, personal development, reading, yilungc",
  authors: [{ name: "Yilung C" }],
  creator: "Yilung C",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yilungc.com",
    title: "yilungc - Book Reviews & UK Life Adventures",
    description: "A personal blog by Yilung C featuring book reviews and UK life experiences.",
    siteName: "yilungc",
  },
  twitter: {
    card: "summary_large_image",
    title: "yilungc - Book Reviews & UK Life Adventures",
    description: "A personal blog by Yilung C featuring book reviews and UK life experiences.",
    creator: "@yilungc", // Placeholder for Twitter/X handle
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} scroll-smooth`}>
      <body className={`font-sans antialiased bg-background`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
