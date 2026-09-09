import type { LucideIcon } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, tone = 'brand' }: {
  icon: LucideIcon; label: string; value: string | number; tone?: 'brand' | 'accent' | 'flag';
}) {
  const toneClasses = {
    brand: 'bg-brand-light text-brand-dark',
    accent: 'bg-accent/15 text-[#8a6400]',
    flag: 'bg-flag/10 text-flag',
  }[tone];

  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${toneClasses}`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-extrabold text-ink leading-tight">{value}</p>
        <p className="text-xs text-ink-muted font-medium truncate">{label}</p>
      </div>
    </div>
  );
}
