// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/kosar',
        '/penztar',
        '/penztar/*',
      ],
    },
    sitemap: 'https://dolce-home.hu/sitemap.xml',
  }
}