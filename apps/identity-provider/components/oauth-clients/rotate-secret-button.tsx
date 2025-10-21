'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RotateSecretButtonProps {
  clientId: string;
  clientName: string;
}

export function RotateSecretButton({
  clientId,
  clientName,
}: RotateSecretButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRotate = async () => {
    if (
      !confirm(
        `Rotate secret for "${clientName}"?\n\n⚠️ WARNING:\n` +
          `- The old secret will be IMMEDIATELY invalidated\n` +
          `- All apps using the old secret will STOP working\n` +
          `- You must update your application with the new secret\n\n` +
          `Continue?`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/oauth-clients/${clientId}/rotate-secret`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rotate secret');
      }

      // Show new secret
      alert(
        `✅ Secret Rotated Successfully!\n\n` +
          `New Client Secret (SAVE THIS NOW!):\n${data.client_secret}\n\n` +
          `⚠️ You will NOT be able to see this secret again!\n` +
          `⚠️ Update your application immediately!`
      );

      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRotate}
      disabled={loading}
      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
    >
      {loading ? 'Rotating...' : 'Rotate Secret'}
    </button>
  );
}
