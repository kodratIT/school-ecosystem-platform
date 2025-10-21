'use client';

import { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  HelpCircle,
  Trash2,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  Shield,
} from 'lucide-react';

interface Session {
  id: string;
  client_id: string;
  client_name: string;
  client_logo_url?: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  device_name?: string;
  browser?: string;
  os?: string;
  ip_address: string;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
}

const DeviceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'desktop':
      return <Monitor className="w-8 h-8" />;
    case 'mobile':
      return <Smartphone className="w-8 h-8" />;
    case 'tablet':
      return <Tablet className="w-8 h-8" />;
    default:
      return <HelpCircle className="w-8 h-8" />;
  }
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setError(null);
      const response = await fetch('/api/user/sessions');
      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (sessionId: string, deviceName: string) => {
    if (
      !confirm(
        `Terminate session on ${deviceName || 'this device'}?\n\nYou will be logged out from that device.`
      )
    ) {
      return;
    }

    setTerminating(sessionId);
    try {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }

      await loadSessions();
    } catch (err) {
      console.error('Failed to terminate session:', err);
      alert(err instanceof Error ? err.message : 'Failed to terminate session');
    } finally {
      setTerminating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-gray-600 mt-2">
            Manage devices and apps where you're currently signed in
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-gray-600 mt-2">
            Manage devices and apps where you're currently signed in
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                Error Loading Sessions
              </h3>
              <p className="text-sm text-red-800 mt-1">{error}</p>
              <button
                onClick={loadSessions}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Active Sessions</h1>
        <p className="text-gray-600 mt-2">
          Manage devices and apps where you're currently signed in
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Sessions
          </h3>
          <p className="text-gray-600">
            You don't have any active sessions at the moment
          </p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  <strong>Security Tip:</strong> If you see a session you don't
                  recognize, terminate it immediately and change your password.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Device Icon */}
                    <div className="text-gray-600 flex-shrink-0">
                      <DeviceIcon type={session.device_type} />
                    </div>

                    {/* Session Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.device_name ||
                              session.browser ||
                              'Unknown Device'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {session.client_name || 'Identity Provider'}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            handleTerminate(
                              session.id,
                              session.device_name ||
                                session.browser ||
                                'this device'
                            )
                          }
                          disabled={terminating === session.id}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                        >
                          {terminating === session.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Terminating...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              End Session
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{session.ip_address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            Last active:{' '}
                            {new Date(
                              session.last_activity_at
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {(session.browser || session.os) && (
                        <div className="mt-2 text-sm text-gray-600">
                          {session.browser && <span>{session.browser}</span>}
                          {session.browser && session.os && <span> • </span>}
                          {session.os && <span>{session.os}</span>}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        Created: {new Date(session.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
