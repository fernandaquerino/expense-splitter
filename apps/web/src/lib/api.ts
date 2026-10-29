import type {
  CreateExpenseInput,
  CreateGroupInput,
  CreateMemberInput,
  Currency,
  Expense,
  ExpenseFilters,
  GroupDetail,
  GroupListItem,
  Member,
  UpdateExpenseInput,
  UpdateGroupInput,
} from './types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** RSC data freshness; defaults to no-store so dashboards reflect writes. */
  cache?: RequestCache;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, cache = 'no-store', signal } = options;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache,
      signal,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? safeParse(text) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(data, res.status));
  }

  return data as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return `Request failed (${status})`;
}

function buildQuery(filters?: ExpenseFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.payerId) params.set('payerId', filters.payerId);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  // groups
  listGroups: () => request<GroupListItem[]>('/groups'),
  getGroup: (id: string) => request<GroupDetail>(`/groups/${id}`),
  createGroup: (input: CreateGroupInput) =>
    request<GroupDetail>('/groups', { method: 'POST', body: input }),
  updateGroup: (id: string, input: UpdateGroupInput) =>
    request<GroupDetail>(`/groups/${id}`, { method: 'PATCH', body: input }),
  deleteGroup: (id: string) =>
    request<void>(`/groups/${id}`, { method: 'DELETE' }),

  // members
  addMember: (groupId: string, input: CreateMemberInput) =>
    request<Member>(`/groups/${groupId}/members`, { method: 'POST', body: input }),
  updateMember: (groupId: string, memberId: string, input: Partial<CreateMemberInput>) =>
    request<Member>(`/groups/${groupId}/members/${memberId}`, {
      method: 'PATCH',
      body: input,
    }),
  removeMember: (groupId: string, memberId: string) =>
    request<void>(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE' }),

  // expenses
  listExpenses: (groupId: string, filters?: ExpenseFilters) =>
    request<Expense[]>(`/groups/${groupId}/expenses${buildQuery(filters)}`),
  getExpense: (groupId: string, id: string) =>
    request<Expense>(`/groups/${groupId}/expenses/${id}`),
  createExpense: (groupId: string, input: CreateExpenseInput) =>
    request<Expense>(`/groups/${groupId}/expenses`, { method: 'POST', body: input }),
  updateExpense: (groupId: string, id: string, input: UpdateExpenseInput) =>
    request<Expense>(`/groups/${groupId}/expenses/${id}`, {
      method: 'PATCH',
      body: input,
    }),
  deleteExpense: (groupId: string, id: string) =>
    request<void>(`/groups/${groupId}/expenses/${id}`, { method: 'DELETE' }),

  // meta
  getCurrencies: () => request<Currency[]>('/meta/currencies'),
  getCategories: () => request<string[]>('/meta/categories'),
};
