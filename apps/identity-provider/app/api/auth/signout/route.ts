import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, verifySession } from '@/lib/auth';
import { createAuditLog } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get current user before deleting session
    const session = await verifySession();
    const userId = session?.userId || null;

    // Get request info for audit log
    const ip_address =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      null;
    const user_agent = request.headers.get('user-agent') || null;

    // Delete session
    await deleteSession();

    // Log logout
    if (userId) {
      await createAuditLog({
        user_id: userId,
        action: 'user.logout',
        resource_type: 'auth',
        metadata: { timestamp: new Date().toISOString() },
        ip_address,
        user_agent,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
