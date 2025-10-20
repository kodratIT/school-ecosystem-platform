export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 lg:block">
        <div className="flex h-full flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-3xl font-bold">School Ecosystem</h1>
            <p className="mt-2 text-blue-100">Identity Provider</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">
                Centralized Authentication
              </h2>
              <p className="mt-2 text-lg text-blue-100">
                One account for all school applications
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Single Sign-On</p>
                  <p className="text-sm text-blue-100">
                    Access all apps with one login
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Secure & Private</p>
                  <p className="text-sm text-blue-100">
                    Your data is protected
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Fast & Reliable</p>
                  <p className="text-sm text-blue-100">
                    Lightning-fast authentication
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-blue-200">
            © 2024 School Ecosystem. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
