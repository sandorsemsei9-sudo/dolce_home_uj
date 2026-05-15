// app/sitemap.ts
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client' // Ellenőrizd, hogy ez az útvonal nálad jó-e!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const baseUrl = 'https://dolce-home.hu'

  // 1. Lekérjük az összes termék slug-ját a 'products' táblából
  // Ha a táblád neve más (pl. 'canvas_prints'), írd át!
  const { data: products } = await supabase
    .from('products') 
    .select('slug')

  // 2. Dinamikus termékoldalak generálása
  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/vaszonkepek/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 3. Statikus oldalak listája
  const staticPaths = [
    '',
    '/egyedi-vaszonkep',
    '/vaszonkepek',
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

  // Összefűzzük a kettőt
  return [...staticUrls, ...productUrls]
}