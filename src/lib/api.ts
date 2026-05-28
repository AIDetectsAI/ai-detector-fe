const API_BASE = 'http://localhost:8081';

async function getErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
    if (data && typeof data === 'object') {
      const msg = (data as any).message || (data as any).error;
      if (typeof msg === 'string' && msg.trim()) return msg;
      try {
        return JSON.stringify(data);
      } catch {
        // fallthrough
      }
    }
  }

  const text = await res.text().catch(() => '');
  return text || res.statusText || 'Request failed';
}

function requireToken(): string {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}

// --- Auth helpers ---

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUsername(): string {
  if (typeof window === 'undefined') return 'User';
  return localStorage.getItem('username') || 'User';
}

export function setAuth(token: string, username: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
}

export function removeAuth(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// --- API calls ---

export async function loginUser(
  login: string,
  password: string,
): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  if (!res.ok) {
    throw new Error((await getErrorMessage(res)) || 'Login failed');
  }
  return res.json();
}

export async function registerUser(
  login: string,
  password: string,
  email: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password, email }),
  });
  if (!res.ok) {
    throw new Error((await getErrorMessage(res)) || 'Registration failed');
  }
  return res.text();
}

export interface AnalysisResult {
  certainty: number;
  modelUsed: string;
  processingTimeMs: number;
}

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const token = requireToken();

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/api/model/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    throw new Error((await getErrorMessage(res)) || 'Analysis failed');
  }
  return res.json();
}

// --- OAuth URLs ---

export function getGoogleOAuthUrl(): string {
  return `${API_BASE}/oauth2/authorization/google`;
}

export function getGitHubOAuthUrl(): string {
  return `${API_BASE}/oauth2/authorization/github`;
}

// --- User profile ---

export interface UserProfile {
  login: string;
  email: string;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const token = requireToken();

  const res = await fetch(`${API_BASE}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(
      (await getErrorMessage(res)) || 'Failed to fetch user profile',
    );
  }
  return res.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const token = requireToken();

  const res = await fetch(`${API_BASE}/api/me/password`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    throw new Error(
      (await getErrorMessage(res)) || 'Failed to change password',
    );
  }
}

export async function deleteAccount(): Promise<void> {
  const token = requireToken();

  const res = await fetch(`${API_BASE}/api/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error((await getErrorMessage(res)) || 'Failed to delete account');
  }
}

// --- History ---

export interface HistoryEntry {
  id: string;
  photoUrl: string;
  model: string;
  chance: number;
  createdAt: string;
}

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const token = requireToken();

  const res = await fetch(`${API_BASE}/api/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error((await getErrorMessage(res)) || 'Failed to fetch history');
  }
  return res.json();
}

export async function clearHistory(): Promise<void> {
  const token = requireToken();

  const res = await fetch(`${API_BASE}/api/history/all`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error((await getErrorMessage(res)) || 'Failed to clear history');
  }
}

export async function deleteHistoryEntry(resultId: string): Promise<void> {
  const token = requireToken();

  const res = await fetch(
    `${API_BASE}/api/history/${encodeURIComponent(resultId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    throw new Error(
      (await getErrorMessage(res)) || 'Failed to delete history entry',
    );
  }
}

// --- Queries (legacy) ---

export async function deleteQuery(
  userLogin: string,
  queryId: number | string,
): Promise<void> {
  const token = requireToken();

  const res = await fetch(
    `${API_BASE}/api/users/${encodeURIComponent(userLogin)}/queries/${encodeURIComponent(String(queryId))}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    throw new Error((await getErrorMessage(res)) || 'Failed to delete query');
  }
}

export async function deleteAllQueries(userLogin: string): Promise<void> {
  const token = requireToken();

  const res = await fetch(
    `${API_BASE}/api/users/${encodeURIComponent(userLogin)}/queries/all`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    throw new Error((await getErrorMessage(res)) || 'Failed to delete queries');
  }
}
