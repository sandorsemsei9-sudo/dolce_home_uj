// app/sitemap.ts
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server' // Szerver klienst használunk!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://www.dolce-home.hu' // A next.config.ts-ed miatt a WWW-s verziót használjuk fő verziónak

  // 1. TERMÉKEK LEKÉRDEZÉSE (A terméktáblád neve alapján, ha az is 'products')
  const { data: products } = await supabase
    .from('products') 
    .select('slug')

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/vaszonkepek/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 2. BLOGBEJEGYZÉSEK LEKÉRDEZÉSE (Most már biztosan 'posts'!)
  const { data: blogs } = await supabase
    .from('posts')
    .select('slug, created_at')
    // Csak a publikált cikkek menjenek a térképbe, pontosan úgy, mint a blog oldalon
    .eq('published', true) 

  const blogUrls = (blogs || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    // Ha a táblában a dátum stringként van, átalakítjuk Date objektummá
    lastModified: post.created_at ? new Date(post.created_at) : new Date(),
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

  // Összefűzzük: Statikus oldalak + 62 Termék + Összes Blog cikk
  return [...staticUrls, ...productUrls, ...blogUrls]
}