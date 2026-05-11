/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://dolce-home.hu',
  generateRobotsTxt: true,
  // Itt adhatod meg, mit hagyjon ki a listából:
  exclude: [
    '/admin',
    '/admin/*',
    '/kosar',
    '/penztar',
    '/penztar/*',
    '/icon.png'
  ],
}

export default config