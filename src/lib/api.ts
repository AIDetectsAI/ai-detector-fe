const API_BASE = 'http://localhost:8081';

// --- Auth helpers ---

export function getToken(): string | null {
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
    const text = await res.text();
    throw new Error(text || 'Login failed');
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
    const text = await res.text();
    throw new Error(text || 'Registration failed');
  }
  return res.text();
}

export interface AnalysisResult {
  certainty: number;
  modelUsed: string;
  processingTimeMs: number;
}

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/api/model/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Analysis failed' }));
    throw new Error(data.message || 'Analysis failed');
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
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return res.json();
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
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch history');
  }
  return res.json();
}
