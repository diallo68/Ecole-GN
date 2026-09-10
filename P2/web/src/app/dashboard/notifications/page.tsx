'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationApi } from '@/lib/api';
import { NOTIFICATION_ICONS, ilYA } from '@/components/NotificationBell';
import EmptyState from '@/components/EmptyState';
import type { AppNotification } from '@/types';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi.mine().then(d => setNotifications(d.notifications)).finally(() => setLoading(false));
  }, []);

  const nonLues = notifications.filter(n => !n.lu).length;

  const onClickNotif = (n: AppNotification) => {
    if (!n.lu) {
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, lu: true } : x));
      notificationApi.markRead(n._id).catch(() => {});
    }
    if (n.lien) router.push(n.lien);
  };

  const toutMarquer = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    notificationApi.markAllRead().catch(() => {});
  };

  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-ink/10">
        <h1 className="font-bold text-ink">Notifications</h1>
        {nonLues > 0 && (
          <button onClick={toutMarquer} className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline">
            <CheckCheck size={14} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <p className="p-4 text-sm text-ink-muted">Chargement...</p>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} className="px-4 py-10" message="Vos notifications (messages, réservations, validation de profil) apparaîtront ici." />
      ) : (
        <div>
          {notifications.map(n => {
            const Icon = NOTIFICATION_ICONS[n.type] || Bell;
            return (
              <button key={n._id} onClick={() => onClickNotif(n)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-ink/5 last:border-b-0 hover:bg-sand transition-colors ${!n.lu ? 'bg-brand-light/40' : ''}`}>
                <Icon size={17} className={`mt-0.5 shrink-0 ${!n.lu ? 'text-brand' : 'text-ink/40'}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${!n.lu ? 'font-semibold text-ink' : 'text-ink/70'}`}>{n.texte}</span>
                  <span className="block text-xs text-ink-muted mt-0.5">{ilYA(n.createdAt)}</span>
                </span>
                {!n.lu && <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
