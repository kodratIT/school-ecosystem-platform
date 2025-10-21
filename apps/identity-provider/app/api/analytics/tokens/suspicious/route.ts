import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { detectSuspiciousTokenActivity } from '@repo/database-identity';
import { z } from 'zod';

const suspiciousQuerySchema = z.object({
  lookbackHours: z.coerce.number().min(1).max(72).optional(),
  threshold: z.coerce.number().min(1).max(100).optional(),
});

/**
 * GET /api/analytics/tokens/suspicious
 *
 * Detect suspicious token activity patterns
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
    const validation = suspiciousQuerySchema.safeParse({
      lookbackHours: searchParams.get('lookbackHours'),
      threshold: searchParams.get('threshold'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const params = validation.data;
    const suspicious = await detectSuspiciousTokenActivity(
      params.lookbackHours || 24,
      params.threshold || 5
    );

    return NextResponse.json({
      lookbackHours: params.lookbackHours || 24,
      threshold: params.threshold || 5,
      suspicious,
    });
  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
