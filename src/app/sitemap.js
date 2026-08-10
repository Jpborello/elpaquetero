const SITE_URL = 'https://www.elpaquetero.com.ar';

export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    }
  ];
}
