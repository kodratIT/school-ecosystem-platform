'use client';

import { CheckCircle, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LogoutConfirmPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <CheckCircle className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center">
            You've Been Logged Out
          </h1>
          <p className="text-center text-green-100 mt-2">
            Your session has been terminated successfully
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Security Notice
                </p>
                <p className="text-sm text-blue-800">
                  You may still be logged in to some applications. For complete
                  security, please close your browser or logout from those
                  applications individually.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-600 mb-6">
            <p className="text-sm">
              Thank you for using our platform. Your data and privacy are
              important to us.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sign In Again
            </Link>

            <Link
              href="/"
              className="block text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-xs text-center text-gray-500">
            If you didn't initiate this logout, please{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              sign in
            </Link>{' '}
            and change your password immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
