/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://dolce-home.hu',
  generateRobotsTxt: true,
  // Ez veszi ki az oldalakat a sitemap.xml fájlból
  exclude: [
    '/admin',
    '/admin/*',
    '/kosar',
    '/penztar',
    '/penztar/*',
    '/icon.png'
  ],
  // Ez pedig ténylegesen megmondja a Google robotnak, hogy ne is próbálja megnyitni őket
  robotsTxtOptions: {
    policies: [
      {
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
    ],
  },
}

export default config