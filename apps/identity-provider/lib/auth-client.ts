/**
 * Custom Auth Client
 * Client-side authentication functions
 */

export async function signIn(credentials: {
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Sign in failed' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function signUp(data: {
  email: string;
  password: string;
  name: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, error: result.error || 'Sign up failed' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/signout', {
    method: 'POST',
  });
  window.location.href = '/login';
}
