'use client';

import { signOut } from '@/lib/auth-client';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
    >
      Sign out
    </button>
  );
}
