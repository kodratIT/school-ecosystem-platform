'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { RotateSecretModal } from './rotate-secret-modal';

interface RotateSecretButtonProps {
  clientId: string;
  clientName: string;
}

export function RotateSecretButton({
  clientId,
  clientName,
}: RotateSecretButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-xl font-bold hover:from-yellow-700 hover:to-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Rotate Client Secret
      </button>

      <RotateSecretModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId}
        clientName={clientName}
      />
    </>
  );
}
