import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createAuditLog } from '@/lib/db';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get request info for audit log
    const ip_address =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      null;
    const user_agent = request.headers.get('user-agent') || null;

    // Get user from database
    const user = await getUserByEmail(email);

    if (!user || !user.password_hash) {
      // Log failed login attempt
      await createAuditLog({
        user_id: null,
        action: 'user.login.failed',
        resource_type: 'auth',
        metadata: { email, reason: 'Invalid credentials' },
        ip_address,
        user_agent,
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active || user.is_banned) {
      // Log failed login attempt
      await createAuditLog({
        user_id: user.id,
        action: 'user.login.blocked',
        resource_type: 'auth',
        metadata: {
          email,
          reason: user.is_banned ? 'Account banned' : 'Account inactive',
        },
        ip_address,
        user_agent,
        school_id: user.school_id,
      });

      return NextResponse.json(
        { error: 'Account is inactive or banned' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      // Log failed login attempt
      await createAuditLog({
        user_id: user.id,
        action: 'user.login.failed',
        resource_type: 'auth',
        metadata: { email, reason: 'Invalid password' },
        ip_address,
        user_agent,
        school_id: user.school_id,
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.id);

    // Log successful login
    await createAuditLog({
      user_id: user.id,
      action: 'user.login',
      resource_type: 'auth',
      metadata: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ip_address,
      user_agent,
      school_id: user.school_id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
