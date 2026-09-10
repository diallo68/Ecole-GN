'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, CheckCheck, MessageCircle, CalendarCheck, CalendarX, ShieldCheck } from 'lucide-react';
import { notificationApi } from '@/lib/api';
import EmptyState from './EmptyState';
import type { AppNotification, NotificationType } from '@/types';

const ICONS: Record<NotificationType, typeof MessageCircle> = {
  message: MessageCircle,
  reservation_confirmee: CalendarCheck,
  reservation_annulee: CalendarX,
  profil_valide: ShieldCheck,
};

// "il y a 5 min" / "il y a 3 h" / "il y a 2 j" — pas besoin d'une librairie
// pour un texte aussi simple, et évite une dépendance de plus.
export function ilYA(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  return `il y a ${j} j`;
}

export { ICONS as NOTIFICATION_ICONS };

// Cloche de notifications dans la navbar desktop. Le compteur est possédé
// par Navbar (même schéma que le badge Messages, réutilisé aussi par le
// point sur le bouton Menu mobile) : ce composant le reçoit en props et le
// met à jour localement au clic, sans attendre le prochain sondage.
export default function NotificationBell({ count, setCount }: { count: number; setCount: Dispatch<SetStateAction<number>> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || loaded) return;
    notificationApi.mine().then(d => { setNotifications(d.notifications); setLoaded(true); }).catch(() => {});
  }, [open, loaded]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const onClickNotif = (n: AppNotification) => {
    setOpen(false);
    if (!n.lu) {
      setCount(c => Math.max(0, c - 1));
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, lu: true } : x));
      notificationApi.markRead(n._id).catch(() => {});
    }
    if (n.lien) router.push(n.lien);
  };

  const toutMarquer = () => {
    setCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    notificationApi.markAllRead().catch(() => {});
  };

  return (
    <div className="relative" ref={ref}>
      <button ref={btnRef} onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open} aria-controls="notification-panel"
        aria-label={`Notifications${count > 0 ? ` (${count} non lues)` : ''}`}
        className="relative hover:text-ink transition-colors">
        {count > 0 ? <BellRing size={20} strokeWidth={2} /> : <Bell size={20} strokeWidth={2} />}
        {count > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-flag text-white text-[10px] font-bold grid place-items-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div id="notification-panel" role="menu" className="absolute right-0 top-full mt-2 w-80 max-w-[85vw] bg-white rounded-xl border border-ink/10 shadow-lg py-1.5 z-30">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-ink/5">
            <p className="font-semibold text-ink text-sm">Notifications</p>
            {count > 0 && (
              <button onClick={toutMarquer} className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                <CheckCheck size={13} /> Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {!loaded ? (
              <p className="px-3.5 py-6 text-center text-sm text-ink-muted">Chargement...</p>
            ) : notifications.length === 0 ? (
              <EmptyState icon={Bell} message="Aucune notification pour l'instant." className="px-4" />
            ) : (
              notifications.map(n => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <button key={n._id} role="menuitem" onClick={() => onClickNotif(n)}
                    className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-sand transition-colors ${!n.lu ? 'bg-brand-light/40' : ''}`}>
                    <Icon size={15} className={`mt-0.5 shrink-0 ${!n.lu ? 'text-brand' : 'text-ink/40'}`} />
                    <span className="min-w-0 flex-1">
                      <span className={`block ${!n.lu ? 'font-semibold text-ink' : 'text-ink/70'}`}>{n.texte}</span>
                      <span className="block text-xs text-ink-muted mt-0.5">{ilYA(n.createdAt)}</span>
                    </span>
                    {!n.lu && <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />}
                  </button>
                );
              })
            )}
          </div>
          <div className="border-t border-ink/5 pt-1">
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)}
              className="block text-center px-3.5 py-2 text-xs font-semibold text-brand hover:underline">
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
