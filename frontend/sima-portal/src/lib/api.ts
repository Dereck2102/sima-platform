export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

const getBaseUrl = () => {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return null;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
};

export async function fetchJson<T>(path: string): Promise<ApiResult<T>> {
  const base = getBaseUrl();
  if (!base) {
    return { data: null, error: 'API base URL not configured' };
  }
  try {
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    const res = await fetch(`${base}${path}`, { cache: 'no-store', headers });
    if (!res.ok) {
      return { data: null, error: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as T;
    return { data: json, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Request failed' };
  }
}
