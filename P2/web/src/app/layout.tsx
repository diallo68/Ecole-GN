import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gandal — Soutien scolaire en Guinée',
  description: 'Trouve un enseignant, réserve un cours, teste-toi avec nos quiz — Gandal, connaissance pour tous.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-sand flex flex-col min-h-screen">
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
