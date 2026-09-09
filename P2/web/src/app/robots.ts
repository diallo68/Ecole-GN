import type { MetadataRoute } from 'next';

// Les espaces connectés (dashboard, admin, profil) restent protégés par le
// backend — ce fichier n'est qu'une indication aux moteurs de recherche
// pour ne pas indexer des écrans d'accès sans intérêt public.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/profil'] },
    ],
    sitemap: 'https://gandall.net/sitemap.xml',
  };
}
