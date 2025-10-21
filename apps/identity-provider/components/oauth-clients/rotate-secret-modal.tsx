'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Copy,
  Check,
  AlertTriangle,
  Key,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

interface RotateSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

export function RotateSecretModal({
  isOpen,
  onClose,
  clientId,
  clientName,
}: RotateSecretModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 50);
      setNewSecret(null);
      setCopiedSecret(false);
      setConfirmed(false);
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  const handleRotate = async () => {
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

      setNewSecret(data.client_secret);
    } catch (error) {
      const err = error as Error;
      alert(`Error: ${err.message}`);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (newSecret && !confirmed) {
      if (
        !confirm(
          'Have you copied the new Client Secret?\n\nYou will NOT be able to see it again!'
        )
      ) {
        return;
      }
    }
    setShow(false);
    setTimeout(() => {
      onClose();
      router.refresh();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 ${
            show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 p-8 rounded-t-2xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <RefreshCw className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Rotate Client Secret
                </h2>
                <p className="text-white/90 text-lg">{clientName}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {!newSecret ? (
              <>
                {/* Warning - Before Rotation */}
                <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full -mr-16 -mt-16" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                      <ShieldAlert className="w-7 h-7 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                        <span className="animate-pulse">⚠️</span>
                        Critical: Understand the Impact
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-red-800">
                          <span className="text-red-500 font-bold">•</span>
                          <span>
                            <strong>Immediate invalidation:</strong> The old
                            secret will stop working instantly
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-red-800">
                          <span className="text-red-500 font-bold">•</span>
                          <span>
                            <strong>App downtime:</strong> All applications
                            using this client will break
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-red-800">
                          <span className="text-red-500 font-bold">•</span>
                          <span>
                            <strong>Manual update required:</strong> You must
                            update your apps with the new secret
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-red-800">
                          <span className="text-red-500 font-bold">•</span>
                          <span>
                            <strong>One-time display:</strong> New secret shown
                            only once, cannot be retrieved
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <p className="text-gray-700 text-sm mb-4">
                    Are you sure you want to rotate the client secret for{' '}
                    <strong className="text-gray-900">{clientName}</strong>?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRotate}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-bold hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Rotating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5" />
                          Rotate Secret Now
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-green-900">
                      Secret Rotated Successfully!
                    </h3>
                  </div>
                  <p className="text-sm text-green-800">
                    Your new client secret has been generated. The old secret is
                    now invalid.
                  </p>
                </div>

                {/* New Secret Display */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border-2 border-amber-300 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/20 rounded-full -mr-12 -mt-12" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-yellow-100 rounded-lg p-2 animate-pulse">
                        <Key className="w-5 h-5 text-yellow-600" />
                      </div>
                      <label className="text-sm font-bold text-yellow-900">
                        New Client Secret
                      </label>
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow">
                        COPY NOW!
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 text-sm bg-white px-4 py-3.5 rounded-lg font-mono border-2 border-yellow-400 select-all shadow-inner break-all">
                        {newSecret}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newSecret)}
                        className={`px-5 py-3.5 rounded-lg transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 ${
                          copiedSecret
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                        title="Copy New Secret"
                      >
                        {copiedSecret ? (
                          <>
                            <Check className="w-5 h-5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-all"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      <strong className="text-base">
                        I have copied and saved the new secret
                      </strong>{' '}
                      securely. I understand that it{' '}
                      <strong className="text-red-600">
                        will NOT be shown again
                      </strong>{' '}
                      and I must update my applications immediately.
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {newSecret && (
            <div className="flex items-center justify-between p-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 rounded-b-2xl">
              <div className="flex items-center gap-2">
                {confirmed ? (
                  <>
                    <div className="bg-green-100 rounded-full p-1.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-green-700 font-semibold">
                      Ready to continue
                    </span>
                  </>
                ) : (
                  <>
                    <div className="bg-red-100 rounded-full p-1.5 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm text-red-700 font-semibold">
                      Please confirm you've saved the new secret
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={handleClose}
                disabled={!confirmed}
                className={`px-8 py-3 rounded-xl font-bold transition-all transform shadow-lg ${
                  confirmed
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                {confirmed ? '→ Done' : 'Confirm First'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
