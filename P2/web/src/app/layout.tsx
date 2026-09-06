import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gandal — Soutien scolaire en Guinée',
  description: 'Trouve un répétiteur, réserve un cours, teste-toi avec nos quiz — Gandal, connaissance pour tous.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
