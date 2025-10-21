import * as React from 'react';

interface EmailVerificationProps {
  verificationUrl: string;
  email: string;
}

/**
 * Email Verification Template
 * Sent when user registers or requests verification resend
 */
export function EmailVerificationEmail({
  verificationUrl,
  email,
}: EmailVerificationProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 40px 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
          .button:hover {
            background: #5568d3;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .link {
            color: #667eea;
            word-break: break-all;
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1 style={{ margin: 0, fontSize: '28px' }}>🎉 Verify Your Email</h1>
        </div>

        <div className="content">
          <p style={{ fontSize: '16px' }}>Hello,</p>

          <p style={{ fontSize: '16px' }}>
            Thank you for registering with <strong>{email}</strong>. To complete
            your account setup and start using our platform, please verify your
            email address.
          </p>

          <div style={{ textAlign: 'center' }}>
            <a href={verificationUrl} className="button">
              Verify Email Address
            </a>
          </div>

          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Or copy and paste this link into your browser:
          </p>
          <p className="link" style={{ fontSize: '13px' }}>
            {verificationUrl}
          </p>

          <div className="warning">
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              ⚠️ Important Security Information
            </p>
            <ul style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
              <li>This link will expire in 48 hours</li>
              <li>If you didn't create an account, please ignore this email</li>
              <li>
                Never share this link with anyone - it's unique to your account
              </li>
              <li>You can only use this verification link once</li>
            </ul>
          </div>

          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '30px' }}>
            Need help? Contact our support team at{' '}
            <a
              href="mailto:support@example.com"
              style={{ color: '#667eea', textDecoration: 'none' }}
            >
              support@example.com
            </a>
          </p>
        </div>

        <div className="footer">
          <p style={{ margin: '0 0 10px 0' }}>
            This is an automated email. Please do not reply to this message.
          </p>
          <p style={{ margin: 0, fontSize: '13px' }}>
            © 2025 School Ecosystem Platform. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  );
}

/**
 * Plain text version for email clients that don't support HTML
 */
export function emailVerificationPlainText({
  verificationUrl,
  email,
}: EmailVerificationProps): string {
  return `
Verify Your Email Address

Hello,

Thank you for registering with ${email}. To complete your account setup and start using our platform, please verify your email address.

Click the link below to verify your email:
${verificationUrl}

IMPORTANT SECURITY INFORMATION:
- This link will expire in 48 hours
- If you didn't create an account, please ignore this email
- Never share this link with anyone - it's unique to your account
- You can only use this verification link once

Need help? Contact our support team at support@example.com

---
This is an automated email. Please do not reply to this message.
© 2025 School Ecosystem Platform. All rights reserved.
  `.trim();
}
