import { Suspense } from 'react';
import { TokenAnalyticsDashboard } from '@/components/analytics/token-analytics-dashboard';

export const metadata = {
  title: 'Token Analytics - Identity Provider',
  description: 'Monitor OAuth token operations and security',
};

export default function TokenAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Token Analytics</h1>
        <p className="mt-2 text-gray-600">
          Monitor OAuth token operations, detect anomalies, and track usage
          patterns
        </p>
      </div>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <TokenAnalyticsDashboard />
      </Suspense>
    </div>
  );
}
