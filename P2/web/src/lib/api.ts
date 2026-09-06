import type { User, Repetiteur, Reservation, QuizSummary, QuizDetail, QuizCorrection, QuizFull, ContentItem, ClasseVirtuelle } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gandal_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

const get  = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
const patch = <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
const del  = <T>(path: string) => request<T>(path, { method: 'DELETE' });

export const authApi = {
  sendCode: (body: { email: string; prenom: string }) =>
    post<{ success: boolean; emailSent: boolean; sendFailed?: boolean; sendErrorHint?: string; debug_code?: string }>('/auth/send-code', body),

  register: (body: Record<string, unknown>) =>
    post<{ success: boolean; token: string; refreshToken: string; user: User }>('/auth/register', body),

  login: (body: { email: string; password: string }) =>
    post<{ success: boolean; token: string; refreshToken: string; user: User }>('/auth/login', body),

  me: () => get<{ user: User }>('/auth/me'),
};

export const repetiteurApi = {
  list: (params: { matiere?: string; niveau?: string; ville?: string } = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return get<{ repetiteurs: Repetiteur[] }>(`/repetiteurs${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => get<{ repetiteur: Repetiteur }>(`/repetiteurs/${id}`),
  updateMyProfile: (body: Record<string, unknown>) => patch<{ success: boolean }>('/repetiteurs/me/profile', body),

  // Admin
  adminList: (statut?: 'en_attente' | 'valide') =>
    get<{ repetiteurs: Repetiteur[] }>(`/repetiteurs/admin/all${statut ? `?statut=${statut}` : ''}`),
  moderate: (id: string, valide: boolean) => patch<{ success: boolean }>(`/repetiteurs/${id}/moderate`, { valide }),
};

export const reservationApi = {
  create: (body: Record<string, unknown>) => post<{ success: boolean; reservation: Reservation }>('/reservations', body),
  mine: () => get<{ reservations: Reservation[] }>('/reservations/mine'),
  agenda: () => get<{ reservations: Reservation[] }>('/reservations/agenda'),
  updateStatus: (id: string, statut: string) => patch<{ success: boolean }>(`/reservations/${id}/statut`, { statut }),
};

export const quizApi = {
  list: (params: { matiere?: string; niveau?: string } = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return get<{ quizzes: QuizSummary[] }>(`/quiz${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => get<{ quiz: QuizDetail }>(`/quiz/${id}`),
  submit: (id: string, reponses: number[]) =>
    post<{ score: number; total: number; correction: QuizCorrection[] }>(`/quiz/${id}/submit`, { reponses }),

  // Admin
  create: (body: { titre: string; matiere: string; niveau: string; questions: unknown[] }) =>
    post<{ success: boolean; quiz: QuizFull }>('/quiz', body),
  adminList: () => get<{ quizzes: QuizFull[] }>('/quiz/admin/all'),
  adminGetById: (id: string) => get<{ quiz: QuizFull }>(`/quiz/admin/${id}`),
  togglePublish: (id: string, publie: boolean) => patch<{ success: boolean }>(`/quiz/admin/${id}/publish`, { publie }),
  remove: (id: string) => del<{ success: boolean }>(`/quiz/admin/${id}`),
};

type ContentType = 'video' | 'support' | 'exercice';
const contentKey = (type: ContentType) => `${type}s`;

export const contentApi = {
  create: (type: ContentType, body: Record<string, unknown>) =>
    post<{ success: boolean; [key: string]: unknown }>(`/content/${type}s`, body),
  mine: (type: ContentType) =>
    get<Record<string, ContentItem[]>>(`/content/${type}s/mine`).then(d => d[contentKey(type)]),
  byRepetiteur: (type: ContentType, repetiteurId: string) =>
    get<Record<string, ContentItem[]>>(`/content/${type}s/repetiteur/${repetiteurId}`).then(d => d[contentKey(type)]),
  remove: (type: ContentType, id: string) => del<{ success: boolean }>(`/content/${type}s/${id}`),
};

export const classeVirtuelleApi = {
  create: (body: Record<string, unknown>) => post<{ success: boolean; classe: ClasseVirtuelle }>('/classes-virtuelles', body),
  mine: () => get<{ classes: ClasseVirtuelle[] }>('/classes-virtuelles/mine'),
  mineAsEleve: () => get<{ classes: ClasseVirtuelle[] }>('/classes-virtuelles/eleve/mine'),
};

export { del, get, patch, post };
