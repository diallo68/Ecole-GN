import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

// Police auto-hébergée par Next.js (plus de dépendance à Google Fonts au
// chargement) : le fichier est servi depuis gandall.net, avec des poids
// limités à ceux réellement utilisés dans l'interface.
const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const SITE_URL = 'https://gandall.net';
const TITLE = 'Gandal — Soutien scolaire en Guinée';
const DESCRIPTION = 'Trouvez un enseignant, réservez un cours, testez-vous avec nos quiz — Gandal, connaissance pour tous.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · Gandal' },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'Gandal',
    locale: 'fr_GN',
    type: 'website',
    images: ['/accueil/hero.jpeg'],
  },
};

// Organisation et site — informations réelles uniquement (nom, domaine) ;
// pas de coordonnées, note ou avis fabriqués.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: 'Gandal', url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
    { '@type': 'WebSite', name: 'Gandal', url: SITE_URL },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${outfit.className} bg-sand flex flex-col min-h-screen`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* Lien d'évitement : invisible tant qu'il n'a pas le focus (première
            tabulation), permet de sauter la navigation au clavier/lecteur d'écran. */}
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
          Aller au contenu
        </a>
        <Navbar />
        <main id="contenu" className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">{children}</main>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
