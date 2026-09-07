'use client';

import { useEffect, useState } from 'react';
import { Search, IdCard } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { AdminUser, Role } from '@/types';

const ROLE_TABS: Array<{ value: Role | ''; label: string }> = [
  { value: '', label: 'Tous' },
  { value: 'eleve', label: 'Élèves' },
  { value: 'parent', label: 'Parents' },
  { value: 'repetiteur', label: 'Enseignants' },
  { value: 'admin', label: 'Admins' },
];

const ROLE_LABELS: Record<string, string> = { eleve: 'Élève', parent: 'Parent', repetiteur: 'Enseignant', admin: 'Admin' };

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [role, setRole] = useState<Role | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      adminApi.users({ role: role || undefined, search: search || undefined })
        .then(d => setUsers(d.users))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [role, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink">Inscrits</h1>
        <p className="text-sm text-ink/50">{users.length} compte{users.length > 1 ? 's' : ''} affiché{users.length > 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {ROLE_TABS.map(t => (
            <button key={t.value} onClick={() => setRole(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                role === t.value ? 'bg-brand text-white border-brand' : 'bg-white border-ink/15 text-ink/70 hover:border-brand/40'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un nom, email..."
            className="border border-ink/15 rounded-full pl-8 pr-3 py-1.5 text-sm outline-none focus:border-brand w-full sm:w-64" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-ink/50">Chargement...</p>
        ) : users.length === 0 ? (
          <p className="p-4 text-sm text-ink/50">Aucun inscrit ne correspond.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink/40 text-xs border-b border-ink/10">
                  <th className="px-4 py-3 font-semibold"></th>
                  <th className="px-4 py-3 font-semibold">Nom</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Téléphone</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="px-4 py-3 font-semibold">Ville</th>
                  <th className="px-4 py-3 font-semibold">Pièce d'identité</th>
                  <th className="px-4 py-3 font-semibold">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-ink/5 last:border-0 hover:bg-sand/60">
                    <td className="px-4 py-3">
                      {u.photo ? (
                        <img src={u.photo} alt="" className="w-8 h-8 rounded-full object-cover border border-ink/10" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-sand text-ink/40 text-xs font-bold grid place-items-center border border-ink/10">
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{u.prenom} {u.nom}</td>
                    <td className="px-4 py-3 text-ink/60 whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-3 text-ink/60 whitespace-nowrap">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold bg-brand-light text-brand-dark px-2 py-0.5 rounded-full">
                        {ROLE_LABELS[u.role] || u.role}
                        {u.role === 'repetiteur' && (u.repetiteur?.valide ? ' ✓' : ' (attente)')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/60 whitespace-nowrap">{u.city || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.pieceIdentite ? (
                        <a href={u.pieceIdentite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                          <IdCard size={13} /> Voir
                        </a>
                      ) : (
                        <span className="text-xs text-ink/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/50 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
