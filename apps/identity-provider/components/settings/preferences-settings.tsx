'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe, Palette, Bell } from 'lucide-react';

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
      // Simulate API call (coming soon)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMessage('Preferences saved successfully');
    } catch {
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

      <div className="space-y-6">
        {/* Theme */}
        <div className="space-y-2">
          <Label htmlFor="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </Label>
          <select
            id="theme"
            value={preferences.theme}
            onChange={(e) =>
              setPreferences({ ...preferences, theme: e.target.value })
            }
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled
          >
            <option value="light">Light (Default)</option>
            <option value="dark">Dark (Coming Soon)</option>
            <option value="auto">Auto (Coming Soon)</option>
          </select>
          <p className="text-xs text-gray-500">
            Choose your preferred color theme
          </p>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language
          </Label>
          <select
            id="language"
            value={preferences.language}
            onChange={(e) =>
              setPreferences({ ...preferences, language: e.target.value })
            }
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled
          >
            <option value="en">English (Default)</option>
            <option value="id">Bahasa Indonesia (Coming Soon)</option>
          </select>
          <p className="text-xs text-gray-500">
            Select your preferred language
          </p>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Label>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Email Notifications
              </p>
              <p className="text-xs text-gray-500">
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
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() =>
              setPreferences({
                theme: 'light',
                language: 'en',
                notifications: true,
              })
            }
          >
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Some preferences are coming soon in future
          updates. Stay tuned for theme switching and multi-language support!
        </p>
      </div>
    </div>
  );
}
