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
            <SecuritySettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="preferences">
          <Suspense fallback={<div>Loading...</div>}>
            <PreferencesSettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-gray-600">
              View your recent account activity and login history.
            </p>
            <a
              href="/audit"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              View Full Audit Logs →
            </a>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
