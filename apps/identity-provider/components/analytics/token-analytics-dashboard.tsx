'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Users, Key, RefreshCw, XCircle } from 'lucide-react';

interface AnalyticsData {
  dateRange: { start: string; end: string };
  stats: {
    total_issued: number;
    total_refreshed: number;
    total_failed: number;
    total_userinfo_accessed: number;
    unique_users: number;
    unique_clients: number;
  };
  byGrantType: Array<{ grant_type: string; count: number }>;
  byClient: Array<{
    client_id: string;
    client_name: string;
    token_count: number;
    unique_users: number;
    last_used: string;
  }>;
  failedAttempts: Array<{
    created_at: string;
    action: string;
    client_id: string;
    error: string;
    ip_address: string;
  }>;
  suspicious: Array<{
    ip_address: string;
    client_id: string;
    failed_attempts: number;
    unique_users: number;
    first_attempt: string;
    last_attempt: string;
  }>;
}

export function TokenAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics/tokens');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-red-600">
        <XCircle className="h-12 w-12 mx-auto mb-4" />
        <p>Error: {error || 'No data available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tokens Issued"
          value={data.stats.total_issued}
          icon={<Key className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Tokens Refreshed"
          value={data.stats.total_refreshed}
          icon={<RefreshCw className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Failed Attempts"
          value={data.stats.total_failed}
          icon={<XCircle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Active Users"
          value={data.stats.unique_users}
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Suspicious Activity Alert */}
      {data.suspicious.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                Suspicious Activity Detected
              </h3>
              <p className="text-sm text-red-800 mt-1">
                {data.suspicious.length} IP address(es) with multiple failed
                attempts detected
              </p>
            </div>
          </div>
        </div>
      )}

      {/* By Grant Type */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tokens by Grant Type</h3>
        <div className="space-y-3">
          {data.byGrantType.map((item) => (
            <div
              key={item.grant_type}
              className="flex items-center justify-between"
            >
              <span className="text-gray-700 capitalize">
                {item.grant_type.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((item.count / data.stats.total_issued) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="font-semibold text-gray-900 w-12 text-right">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Clients</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Tokens
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Users
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Used
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.byClient.map((client) => (
                <tr key={client.client_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">
                        {client.client_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {client.client_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    {client.token_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {client.unique_users}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(client.last_used).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Failures */}
      {data.failedAttempts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Failed Attempts</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.failedAttempts.slice(0, 10).map((attempt, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded"
              >
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-red-900">
                      {attempt.action}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{attempt.client_id}</span>
                  </div>
                  <p className="text-xs text-red-800 mt-1">{attempt.error}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {attempt.ip_address} •{' '}
                    {new Date(attempt.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suspicious Activity Details */}
      {data.suspicious.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-900">
            Suspicious Activity Details
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client ID
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Failed Attempts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time Range
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.suspicious.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {item.ip_address}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.client_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.failed_attempts}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(item.first_attempt).toLocaleString()} -{' '}
                      {new Date(item.last_attempt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`rounded-full p-3 ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
