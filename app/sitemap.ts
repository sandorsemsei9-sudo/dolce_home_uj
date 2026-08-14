import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// 🚀 FONTOS: Ez garantálja, hogy a Next.js minden egyes kérésre élőben lekérdezze a Supabase-t
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.dolce-home.hu'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Hiányzó Supabase környezeti változók a sitemap generálásnál!')
  }

  const supabase = createClient(supabaseUrl || '', supabaseKey || '')

  // 1. TERMÉKEK LEKÉRDEZÉSE
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('slug, updated_at, created_at')

  if (productError) {
    console.error('Sitemap termék lekérdezési hiba:', productError.message)
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
    console.error('Sitemap blog lekérdezési hiba:', blogError.message)
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