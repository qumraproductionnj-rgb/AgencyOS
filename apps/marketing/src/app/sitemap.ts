import type { MetadataRoute } from 'next'

const BASE_URL = 'https://agencyos.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ar', 'en']
  const routes = ['', '/features', '/pricing', '/contact', '/about', '/blog', '/privacy', '/terms']

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : route === '/pricing' ? 0.9 : 0.7,
      })
    }
  }

  return entries
}
