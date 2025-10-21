import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getTokenStats,
  getTokensByGrantType,
  getTokensByClient,
  getFailedTokenAttempts,
  getTokenActivityTimeline,
  getMostActiveUsers,
  detectSuspiciousTokenActivity,
} from '@repo/database-identity';
import { z } from 'zod';

const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clientId: z.string().optional(),
  interval: z.enum(['hour', 'day', 'week', 'month']).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

/**
 * GET /api/analytics/tokens
 *
 * Get comprehensive token analytics
 * Requires authentication and admin role
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is super admin (only admins can view analytics)
    if (
      session.user.role !== 'super_admin' &&
      session.user.role !== 'school_admin'
    ) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const validation = analyticsQuerySchema.safeParse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      clientId: searchParams.get('clientId'),
      interval: searchParams.get('interval'),
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validation.error.errors[0]?.message,
        },
        { status: 400 }
      );
    }

    const params = validation.data;

    // Default date range: last 7 days
    const endDate = params.endDate ? new Date(params.endDate) : new Date();
    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all analytics data in parallel
    const [
      stats,
      byGrantType,
      byClient,
      failedAttempts,
      timeline,
      activeUsers,
      suspicious,
    ] = await Promise.all([
      getTokenStats(startDate, endDate, params.clientId),
      getTokensByGrantType(startDate, endDate, params.clientId),
      getTokensByClient(startDate, endDate, params.limit || 10),
      getFailedTokenAttempts(startDate, endDate, params.limit || 50),
      getTokenActivityTimeline(startDate, endDate, params.interval || 'day'),
      getMostActiveUsers(startDate, endDate, params.limit || 10),
      detectSuspiciousTokenActivity(24, 5), // Last 24 hours, 5+ failures
    ]);

    return NextResponse.json({
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      stats,
      byGrantType,
      byClient,
      failedAttempts,
      timeline,
      activeUsers,
      suspicious,
    });
  } catch (error) {
    console.error('Token analytics error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch analytics data',
      },
      { status: 500 }
    );
  }
}
