import type { User, Repetiteur, Reservation, QuizSummary, QuizDetail, QuizCorrection } from '@/types';

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
};

export const contentApi = {
  create: (type: 'video' | 'support' | 'exercice', body: Record<string, unknown>) => post(`/content/${type}s`, body),
  mine: (type: 'video' | 'support' | 'exercice') => get(`/content/${type}s/mine`),
  byRepetiteur: (type: 'video' | 'support' | 'exercice', repetiteurId: string) => get(`/content/${type}s/repetiteur/${repetiteurId}`),
  remove: (type: 'video' | 'support' | 'exercice', id: string) => del(`/content/${type}s/${id}`),
};

export { del, get, patch, post };
