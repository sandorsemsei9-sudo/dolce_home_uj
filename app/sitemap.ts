import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// 🚀 Óránként frissüljön a sitemap
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.dolce-home.hu'

  // Sima, sütiktől független Supabase kliens a publikus adatokhoz
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. TERMÉKEK LEKÉRDEZÉSE
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('slug, updated_at, created_at')

  if (productError) {
    console.error('Sitemap termék hiba:', productError.message)
  }

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/vaszonkepek/${product.slug}`,
    lastModified: product.updated_at 
      ? new Date(product.updated_at) 
      : (product.created_at ? new Date(product.created_at) : new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 2. BLOGBEJEGYZÉSEK LEKÉRDEZÉSE
  const { data: blogs, error: blogError } = await supabase
    .from('posts')
    .select('slug, created_at, updated_at')
    .eq('published', true)

  if (blogError) {
    console.error('Sitemap blog hiba:', blogError.message)
  }

  const blogUrls = (blogs || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at 
      ? new Date(post.updated_at) 
      : (post.created_at ? new Date(post.created_at) : new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 3. FIX STATIKUS OLDALAK
  const staticPaths = [
    '',
    '/egyedi-vaszonkep',
    '/vaszonkepek',
    '/blog',
    '/kapcsolat',
    '/szallitasi-infok',
    '/aszf',
    '/adatvedelem',
    '/impresszum',
    '/visszakuldes'
  ]

  const staticUrls = staticPaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' || route === '/egyedi-vaszonkep' ? 1.0 : 0.7,
  }))

  return [...staticUrls, ...productUrls, ...blogUrls]
}