import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, createAuditLog } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userIds } = body;

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and userIds are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    switch (action) {
      case 'delete': {
        // Bulk soft delete
        const { error } = await supabase
          .from('users')
          .update({ deleted_at: new Date().toISOString() })
          .in('id', userIds);

        if (error) {
          console.error('Error bulk deleting users:', error);
          return NextResponse.json(
            { error: 'Failed to delete users' },
            { status: 500 }
          );
        }

        // Audit log
        const session = await getSession();
        await createAuditLog({
          user_id: session?.user?.id || null,
          action: 'user.bulk_delete',
          resource_type: 'user',
          metadata: { userIds, count: userIds.length },
          ip_address:
            request.headers.get('x-forwarded-for')?.split(',')[0] || null,
          user_agent: request.headers.get('user-agent') || null,
        });

        return NextResponse.json({
          success: true,
          message: `${userIds.length} users deleted`,
        });
      }

      case 'activate': {
        // Bulk activate
        const { error } = await supabase
          .from('users')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .in('id', userIds);

        if (error) {
          console.error('Error bulk activating users:', error);
          return NextResponse.json(
            { error: 'Failed to activate users' },
            { status: 500 }
          );
        }

        // Audit log
        const session = await getSession();
        await createAuditLog({
          user_id: session?.user?.id || null,
          action: 'user.bulk_activate',
          resource_type: 'user',
          metadata: { userIds, count: userIds.length },
          ip_address:
            request.headers.get('x-forwarded-for')?.split(',')[0] || null,
          user_agent: request.headers.get('user-agent') || null,
        });

        return NextResponse.json({
          success: true,
          message: `${userIds.length} users activated`,
        });
      }

      case 'deactivate': {
        // Bulk deactivate (ban)
        const { error } = await supabase
          .from('users')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .in('id', userIds);

        if (error) {
          console.error('Error bulk deactivating users:', error);
          return NextResponse.json(
            { error: 'Failed to deactivate users' },
            { status: 500 }
          );
        }

        // Audit log
        const session = await getSession();
        await createAuditLog({
          user_id: session?.user?.id || null,
          action: 'user.bulk_deactivate',
          resource_type: 'user',
          metadata: { userIds, count: userIds.length },
          ip_address:
            request.headers.get('x-forwarded-for')?.split(',')[0] || null,
          user_agent: request.headers.get('user-agent') || null,
        });

        return NextResponse.json({
          success: true,
          message: `${userIds.length} users deactivated`,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/users/bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
