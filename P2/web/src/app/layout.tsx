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
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">{children}</main>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
