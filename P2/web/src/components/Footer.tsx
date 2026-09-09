import Link from 'next/link';
import { BookOpen, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-8">
      <div className="max-w-5xl mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3 text-lg font-bold text-ink">
              <span className="w-7 h-7 rounded-lg bg-brand text-white grid place-items-center shrink-0">
                <BookOpen size={14} strokeWidth={2.4} />
              </span>
              Gandal
            </Link>
            <p className="text-sm text-ink/50 leading-relaxed">
              La plateforme de soutien scolaire à Conakry et en Guinée. Apprendre, comprendre, réussir.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-ink text-sm mb-3">Plateforme</h4>
            <ul className="space-y-2.5 text-sm text-ink/60">
              <li><Link href="/repetiteurs" className="hover:text-ink transition-colors">Trouver un enseignant</Link></li>
              <li><Link href="/quiz" className="hover:text-ink transition-colors">Faire un quiz</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-ink text-sm mb-3">Enseignants</h4>
            <ul className="space-y-2.5 text-sm text-ink/60">
              <li><Link href="/register" className="hover:text-ink transition-colors">Devenir enseignant</Link></li>
              <li><Link href="/login" className="hover:text-ink transition-colors">Espace enseignant</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-ink text-sm mb-3">Contact</h4>
            <a href="mailto:support.yougouyougou@gmail.com" className="flex items-start gap-2 text-sm text-ink/60 hover:text-ink transition-colors break-all">
              <Mail size={14} /> support.yougouyougou@gmail.com
            </a>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-6 text-xs text-ink/40">
          © {new Date().getFullYear()} Gandal Guinée. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
