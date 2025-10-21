# STORY-020B: Build Settings Page

**Epic**: Phase 1 - Identity Provider  
**Parent Story**: STORY-020 (Dashboard Features)  
**Story Points**: 3  
**Priority**: P2 (Medium)  
**Status**: 📋 TODO

---

## 📖 Description

As a **user**, I want to **manage my profile settings and preferences** so that **I can customize my account and keep my information up to date**.

This story creates a comprehensive settings page for user profile management, password changes, and application preferences.

---

## 🎯 Goals

- User profile management (name, email, avatar)
- Password change functionality
- Application preferences (theme, language)
- Security settings overview
- Audit log of account activity
- Session management

---

## ✅ Acceptance Criteria

- [ ] User can view and edit profile information
- [ ] User can change password with validation
- [ ] User can upload/change avatar
- [ ] User can set preferences (theme, language)
- [ ] Settings are saved to database
- [ ] Changes trigger audit logs
- [ ] Form validation working
- [ ] Success/error messages shown
- [ ] Mobile responsive
- [ ] All users can access their settings

---

## 📋 Tasks

### Task 1: Settings Page Layout

**File:** `apps/identity-provider/app/(dashboard)/settings/page.tsx`

```typescript
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { ProfileSettings } from '@/components/settings/profile-settings';
import { SecuritySettings } from '@/components/settings/security-settings';
import { PreferencesSettings } from '@/components/settings/preferences-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Sliders, Activity } from 'lucide-react';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Sliders className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Suspense fallback={<div>Loading...</div>}>
            <ProfileSettings user={currentUser} />
          </Suspense>
        </TabsContent>

        <TabsContent value="security">
          <Suspense fallback={<div>Loading...</div>}>
            <SecuritySettings user={currentUser} />
          </Suspense>
        </TabsContent>

        <TabsContent value="preferences">
          <Suspense fallback={<div>Loading...</div>}>
            <PreferencesSettings user={currentUser} />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-gray-600">
              View your recent account activity and login history.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### Task 2: Profile Settings Component

**File:** `apps/identity-provider/components/settings/profile-settings.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, Upload, User } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage('Profile updated successfully');
      window.location.reload();
    } catch (error) {
      setMessage('Error updating profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div>
        <h3 className="text-lg font-semibold">Profile Information</h3>
        <p className="text-sm text-gray-600">
          Update your account profile information
        </p>
      </div>

      {message && (
        <div
          className={`rounded-md p-4 text-sm ${
            message.includes('success')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Avatar Upload */}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-gray-400" />
          )}
        </div>
        <div>
          <Button variant="outline" size="sm" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Upload Avatar
          </Button>
          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG or GIF (max. 2MB)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register('name')}
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register('phone')}
            disabled={loading}
            placeholder="+62 xxx xxxx xxxx"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### Task 3: Security Settings Component

**File:** `apps/identity-provider/components/settings/security-settings.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SecuritySettings({ user }: { user: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      setMessage('Password changed successfully');
      reset();
    } catch (error: any) {
      setMessage(error.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <p className="text-sm text-gray-600">
            Update your password to keep your account secure
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-md p-4 text-sm ${
              message.includes('success')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                {...register('currentPassword')}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword">New Password *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                {...register('newPassword')}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Security Info */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Security Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Two-Factor Authentication</span>
            <span className="font-medium text-gray-400">Coming Soon</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Active Sessions</span>
            <span className="font-medium text-gray-400">Coming Soon</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Login History</span>
            <Button variant="link" size="sm" asChild>
              <a href="/audit">View in Audit Logs</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 4: Preferences Settings Component

**File:** `apps/identity-provider/components/settings/preferences-settings.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export function PreferencesSettings() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
  });

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // API call to save preferences (coming soon)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMessage('Preferences saved successfully');
    } catch (error) {
      setMessage('Error saving preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Preferences</h3>
        <p className="text-sm text-gray-600">
          Customize your application experience
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-md p-4 text-sm ${
            message.includes('success')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="theme">Theme</Label>
          <select
            id="theme"
            value={preferences.theme}
            onChange={(e) =>
              setPreferences({ ...preferences, theme: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled
          >
            <option value="light">Light (Default)</option>
            <option value="dark">Dark (Coming Soon)</option>
            <option value="auto">Auto (Coming Soon)</option>
          </select>
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={preferences.language}
            onChange={(e) =>
              setPreferences({ ...preferences, language: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled
          >
            <option value="en">English (Default)</option>
            <option value="id">Bahasa Indonesia (Coming Soon)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications">Email Notifications</Label>
            <p className="text-sm text-gray-500">
              Receive email notifications for important updates
            </p>
          </div>
          <input
            id="notifications"
            type="checkbox"
            checked={preferences.notifications}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                notifications: e.target.checked,
              })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
            disabled
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" disabled={loading}>
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        * Some preferences are coming soon in future updates
      </p>
    </div>
  );
}
```

---

### Task 5: API Routes for Settings

**File:** `apps/identity-provider/app/api/settings/profile/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseClient, createAuditLog } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get old values
    const { data: oldUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Update profile
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Audit log
    await createAuditLog({
      user_id: session.user.id,
      action: 'user.profile.update',
      resource_type: 'user',
      resource_id: session.user.id,
      old_values: { name: oldUser?.name, email: oldUser?.email, phone: oldUser?.phone },
      new_values: { name, email, phone },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/settings/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**File:** `apps/identity-provider/app/api/settings/password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseClient, createAuditLog } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get current user
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', session.user.id)
      .single();

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating password:', error);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Audit log
    await createAuditLog({
      user_id: session.user.id,
      action: 'user.password.change',
      resource_type: 'user',
      resource_id: session.user.id,
      metadata: { changed_at: new Date().toISOString() },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/settings/password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Testing Instructions

### Test 1: Profile Update

1. Navigate to `/settings`
2. Go to Profile tab
3. Update name, email, or phone
4. Click "Save Changes"
5. Verify update successful
6. Check audit log for `user.profile.update`

---

### Test 2: Password Change

1. Go to Security tab
2. Enter current password
3. Enter new password (min 8 chars)
4. Confirm new password
5. Click "Update Password"
6. Verify success message
7. Try login with new password
8. Check audit log for `user.password.change`

---

### Test 3: Preferences

1. Go to Preferences tab
2. View current settings
3. Note: Most options disabled (coming soon)
4. UI should be responsive

---

### Test 4: Activity Tab

1. Go to Activity tab
2. Should show placeholder
3. Link to audit logs working

---

## 📸 Expected Results

```
Settings Page Features:
✅ Profile information update
✅ Password change with validation
✅ Avatar upload placeholder
✅ Preferences UI (coming soon features)
✅ Security information panel
✅ Activity overview
✅ Form validation
✅ Success/error messages
✅ Audit logging
✅ Mobile responsive
```

---

## ❌ Common Errors & Solutions

### Error: "Current password is incorrect"

**Cause:** Wrong current password entered

**Solution:** Re-enter correct password

---

### Error: "Passwords don't match"

**Cause:** New password and confirm don't match

**Solution:** Ensure both fields match

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-020 (Dashboard Features)
  - STORY-018 (Auth Pages - for password validation)
- **Blocks**: None

---

## 💡 Tips

1. **Password Security** - Enforce strong passwords
2. **Audit Logging** - Track all profile changes
3. **Validation** - Client and server-side
4. **UX** - Clear success/error messages
5. **Coming Soon** - Mark future features clearly

---

## ✏️ Definition of Done

- [ ] Settings page created with tabs
- [ ] Profile update working
- [ ] Password change working
- [ ] Form validation implemented
- [ ] API routes created
- [ ] Audit logging for changes
- [ ] Success/error messages shown
- [ ] Mobile responsive design
- [ ] All tests passing
- [ ] Committed and pushed

---

## 📝 Future Enhancements (Not in this story)

- Avatar upload to cloud storage
- Two-factor authentication
- Active sessions management
- Theme switching (dark mode)
- Multi-language support
- Email notification preferences
- Export account data

---

**Created**: 2025-01-21  
**Story Owner**: Development Team  
**Estimated Time**: 2-3 hours
