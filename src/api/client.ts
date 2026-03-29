let refreshPromise: Promise<boolean> | null = null;

interface ApiFetchOptions {
  retryOn401?: boolean;
}

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { retryOn401 = true } = options;
  const requestInit: RequestInit = {
    credentials: 'include',
    ...init,
  };

  let response = await fetch(input, requestInit);

  if (retryOn401 && response.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await fetch(input, requestInit);
    }
  }

  return response;
}
