import type { MetadataRoute } from 'next';

const BASE = 'https://gandall.net';
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE}/api`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/repetiteurs`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/quiz`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/register`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/login`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Best-effort : les fiches enseignants publiées viennent enrichir le
  // sitemap, mais son absence (API indisponible au moment du build) ne doit
  // jamais faire échouer la génération des routes statiques ci-dessus.
  try {
    const res = await fetch(`${API_URL}/repetiteurs?limit=50`, { next: { revalidate: 3600 } });
    if (!res.ok) return staticRoutes;
    const { repetiteurs } = await res.json();
    const repetiteurRoutes: MetadataRoute.Sitemap = (repetiteurs || []).map((r: { _id: string }) => ({
      url: `${BASE}/repetiteurs/${r._id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    return [...staticRoutes, ...repetiteurRoutes];
  } catch {
    return staticRoutes;
  }
}
