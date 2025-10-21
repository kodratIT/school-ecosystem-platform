import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTokenStats } from '@repo/database-identity';
import { z } from 'zod';

const statsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clientId: z.string().optional(),
});

/**
 * GET /api/analytics/tokens/stats
 *
 * Get aggregated token statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      session.user.role !== 'super_admin' &&
      session.user.role !== 'school_admin'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const validation = statsQuerySchema.safeParse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      clientId: searchParams.get('clientId'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const params = validation.data;
    const endDate = params.endDate ? new Date(params.endDate) : new Date();
    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await getTokenStats(startDate, endDate, params.clientId);

    return NextResponse.json({
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      stats,
    });
  } catch (error) {
    console.error('Token stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
