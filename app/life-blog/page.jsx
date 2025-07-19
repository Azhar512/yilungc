import PostCard from "../../components/post-card"
import { getPostsByCategory } from "../../lib/db"
import { Heart } from "lucide-react"

export const metadata = {
  title: "Life Blog - yilungc",
  description:
    "Personal stories, experiences, and reflections on life. Join me as I share my journey of growth, challenges, and discoveries.",
}


function serializePost(post) {
  return {
    id: post.id,
    title: post.title || '',
    slug: post.slug || '',
    category: post.category || 'life-blog',
    featured_image: post.featured_image || null,
    excerpt: post.excerpt || '',
    content: post.content || '',
    published_at: post.published_at ? new Date(post.published_at).toISOString() : new Date().toISOString(),
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
    createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : null,
    updatedAt: post.updatedAt ? new Date(post.updatedAt).toISOString() : null,
    tags: Array.isArray(post.tags) ? post.tags : [],
    pinned: Boolean(post.pinned),
    
  }
}

export default async function LifeBlogPage() {
  try {
    const rawPosts = await getPostsByCategory("life-blog", 20)
    
    
    const posts = rawPosts.map(serializePost)

    return (
      <div className="min-h-screen bg-background">
        {}
        <section className="bg-gradient-to-r from-secondary via-primary to-accent text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary-foreground/20 backdrop-blur-sm rounded-full">
                  <Heart className="w-12 h-12" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">Life Blog</h1>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Welcome to my personal space where I share life experiences, thoughts, and moments that have shaped who I
                am. Every story has a lesson, every moment has meaning.
              </p>
            </div>
          </div>
        </section>

        {}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {posts.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Life Stories ({posts.length})</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post, index) => (
                    <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No life stories yet</h3>
                <p className="text-muted-foreground">Check back soon for personal stories and life experiences!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error loading life blog page:', error)
    
    return (
      <div className="min-h-screen bg-background">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground">Unable to load life stories. Please try again later.</p>
          </div>
        </section>
      </div>
    )
  }
}