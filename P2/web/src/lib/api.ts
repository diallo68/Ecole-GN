import type { User, Repetiteur, Reservation, QuizSummary, QuizDetail, QuizCorrection, QuizFull, ContentItem, ClasseVirtuelle, Conversation, Message, AdminStats, QuizAttempt, AdminUser, Soumission } from '@/types';

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

// new URLSearchParams(obj) sérialise une valeur `undefined` en la chaîne
// littérale "undefined" (ex: "?matiere=undefined"), ce qui casse les
// filtres côté backend au lieu de les omettre — on retire donc les clés
// vides avant de construire la query string.
function buildQuery(params: Record<string, string | number | undefined>): string {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') clean[k] = String(v);
  }
  return new URLSearchParams(clean).toString();
}

export const authApi = {
  sendCode: (body: { email: string; prenom: string }) =>
    post<{ success: boolean; emailSent: boolean; sendFailed?: boolean; sendErrorHint?: string; debug_code?: string }>('/auth/send-code', body),

  register: (body: Record<string, unknown>) =>
    post<{ success: boolean; token: string; refreshToken: string; user: User }>('/auth/register', body),

  login: (body: { email: string; password: string }) =>
    post<{ success: boolean; token: string; refreshToken: string; user: User }>('/auth/login', body),

  me: () => get<{ user: User }>('/auth/me'),

  updateMe: (body: { prenom?: string; nom?: string; age?: number | null; phone?: string; city?: string; photo?: string; pieceIdentite?: string }) =>
    patch<{ success: boolean; user: User }>('/auth/me', body),
};

export const repetiteurApi = {
  list: (params: { matiere?: string; niveau?: string; ville?: string; disponibilite?: string; tarifMax?: string } = {}) => {
    const qs = buildQuery(params);
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
    const qs = buildQuery(params);
    return get<{ quizzes: QuizSummary[] }>(`/quiz${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => get<{ quiz: QuizDetail }>(`/quiz/${id}`),
  submit: (id: string, reponses: number[]) =>
    post<{ score: number; total: number; correction: QuizCorrection[] }>(`/quiz/${id}/submit`, { reponses }),

  // Admin
  create: (body: { titre: string; matiere: string; niveau: string; questions: unknown[] }) =>
    post<{ success: boolean; quiz: QuizFull }>('/quiz', body),
  mesTentatives: () => get<{ tentatives: QuizAttempt[] }>('/quiz/mes-tentatives'),
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
  listAll: (type: ContentType, params: { matiere?: string; niveau?: string } = {}) => {
    const qs = buildQuery(params);
    return get<Record<string, ContentItem[]>>(`/content/${type}s${qs ? `?${qs}` : ''}`).then(d => d[contentKey(type)]);
  },
  remove: (type: ContentType, id: string) => del<{ success: boolean }>(`/content/${type}s/${id}`),
};

export const classeVirtuelleApi = {
  create: (body: Record<string, unknown>) => post<{ success: boolean; classe: ClasseVirtuelle }>('/classes-virtuelles', body),
  mine: () => get<{ classes: ClasseVirtuelle[] }>('/classes-virtuelles/mine'),
  mineAsEleve: () => get<{ classes: ClasseVirtuelle[] }>('/classes-virtuelles/eleve/mine'),
};

export const messagingApi = {
  conversations: () => get<{ conversations: Conversation[] }>('/messaging/conversations'),
  startOrGet: (otherUserId: string) => post<{ conversation: Conversation }>('/messaging/conversations', { otherUserId }),
  messages: (id: string) => get<{ messages: Message[] }>(`/messaging/conversations/${id}/messages`),
  send: (id: string, text: string) => post<{ success: boolean; message: Message }>(`/messaging/conversations/${id}/messages`, { text }),
};

export const soumissionApi = {
  create: (body: { exerciceId: string; reponseTexte?: string; fichierUrl?: string }) =>
    post<{ success: boolean; soumission: Soumission }>('/soumissions', body),
  mine: () => get<{ soumissions: Soumission[] }>('/soumissions/mine'),
  byExercice: (exerciceId: string) => get<{ soumissions: Soumission[] }>(`/soumissions/exercice/${exerciceId}`),
  corriger: (id: string, body: { note?: number; commentaire?: string }) =>
    patch<{ success: boolean; soumission: Soumission }>(`/soumissions/${id}/corriger`, body),
};

export const uploadApi = {
  file: async (file: File): Promise<{ success: boolean; url: string; type: string; format?: string }> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    return data;
  },
};

export const assistantApi = {
  chat: (messages: Array<{ role: 'user' | 'assistant'; content: string }>) =>
    post<{ reply: string }>('/assistant/chat', { messages }),
};

export const adminApi = {
  stats: () => get<AdminStats>('/admin/stats'),
  users: (params: { role?: string; search?: string } = {}) => {
    const qs = buildQuery(params);
    return get<{ users: AdminUser[] }>(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  conversations: () => get<{ conversations: Conversation[] }>('/admin/conversations'),
};

export { del, get, patch, post };
