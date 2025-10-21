'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Key,
  Fingerprint,
} from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  clientId: string;
  clientSecret: string;
  clientName: string;
}

export function CredentialsModal({
  isOpen,
  clientId,
  clientSecret,
  clientName,
}: CredentialsModalProps) {
  const router = useRouter();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 50);
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    if (!confirmed) {
      if (
        !confirm(
          'Have you copied the Client Secret?\n\nYou will NOT be able to see it again!'
        )
      ) {
        return;
      }
    }
    setShow(false);
    setTimeout(() => router.push('/oauth-clients'), 300);
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
          className={`relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full transform transition-all duration-300 ${
            show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Success Header with Gradient */}
          <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 rounded-t-2xl">
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
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Client Created Successfully!
                </h2>
                <p className="text-white/90 text-lg">{clientName}</p>
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                  <span className="text-sm text-white/90 font-medium">
                    Ready to integrate
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Warning Box - Animated */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full -mr-16 -mt-16" />
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                    <span className="animate-pulse">⚠️</span>
                    CRITICAL: Save Your Credentials Now!
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-red-800">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        <strong>One-time display:</strong> This is the ONLY time
                        the secret will be shown
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-red-800">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        <strong>Hashed storage:</strong> Secret is encrypted in
                        database and cannot be retrieved
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-red-800">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        <strong>Lost secret?</strong> Use "Rotate Secret" to
                        generate a new one
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-red-800">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        <strong>Never commit</strong> secrets to Git or share
                        publicly
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client ID - Improved Design */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Fingerprint className="w-5 h-5 text-blue-600" />
                </div>
                <label className="text-sm font-bold text-blue-900">
                  Client ID
                </label>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm bg-white px-4 py-3.5 rounded-lg font-mono border-2 border-blue-300 select-all shadow-inner break-all">
                  {clientId}
                </code>
                <button
                  onClick={() => copyToClipboard(clientId, 'clientId')}
                  className={`px-5 py-3.5 rounded-lg transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 ${
                    copiedItem === 'clientId'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title="Copy Client ID"
                >
                  {copiedItem === 'clientId' ? (
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

            {/* Client Secret - Enhanced Warning */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border-2 border-amber-300 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/20 rounded-full -mr-12 -mt-12" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-yellow-100 rounded-lg p-2 animate-pulse">
                    <Key className="w-5 h-5 text-yellow-600" />
                  </div>
                  <label className="text-sm font-bold text-yellow-900">
                    Client Secret
                  </label>
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow">
                    COPY NOW!
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm bg-white px-4 py-3.5 rounded-lg font-mono border-2 border-yellow-400 select-all shadow-inner break-all">
                    {clientSecret}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(clientSecret, 'clientSecret')
                    }
                    className={`px-5 py-3.5 rounded-lg transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 ${
                      copiedItem === 'clientSecret'
                        ? 'bg-green-500 text-white'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                    title="Copy Client Secret"
                  >
                    {copiedItem === 'clientSecret' ? (
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

            {/* Confirmation Checkbox - Enhanced */}
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
                    I confirm that I have copied and saved both credentials
                  </strong>{' '}
                  in a secure location. I understand that the Client Secret will{' '}
                  <strong className="text-red-600">NOT be shown again</strong>{' '}
                  after closing this window.
                </span>
              </label>
            </div>
          </div>

          {/* Footer - Modern Design */}
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
                    Please confirm you've saved the credentials
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
              {confirmed ? '→ Continue to Dashboard' : 'Confirm First'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
