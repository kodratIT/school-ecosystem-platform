/**
 * Password Reset Request Email Template
 *
 * Variables:
 * - userName: User's display name
 * - resetUrl: Password reset link with token
 * - expiresIn: Token expiration time (e.g., "1 hour")
 */

interface PasswordResetRequestEmailProps {
  userName: string;
  resetUrl: string;
  expiresIn?: string;
}

export function PasswordResetRequestEmail({
  userName,
  resetUrl,
  expiresIn = '1 hour',
}: PasswordResetRequestEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 24px;">
                Hello <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 24px;">
                You requested to reset your password for your Ekosistem Sekolah account. Click the button below to reset your password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; word-break: break-all; color: #374151; font-size: 14px; line-height: 20px; font-family: 'Courier New', monospace;">
                ${resetUrl}
              </p>
              
              <!-- Warning Box -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 600; font-size: 14px;">
                  ⚠️ Important Security Information:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 20px;">
                  <li>This link expires in <strong>${expiresIn}</strong></li>
                  <li>This link can only be used <strong>once</strong></li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 16px;">
                <strong>Ekosistem Sekolah</strong> - Identity Provider
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 16px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Link -->
        <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
          Need help? <a href="mailto:support@ekosistem-sekolah.com" style="color: #2563eb; text-decoration: none;">Contact Support</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Plain text version for email clients that don't support HTML
export function PasswordResetRequestEmailPlainText({
  userName,
  resetUrl,
  expiresIn = '1 hour',
}: PasswordResetRequestEmailProps): string {
  return `
Hello ${userName},

You requested to reset your password for your Ekosistem Sekolah account.

Reset your password by clicking this link:
${resetUrl}

IMPORTANT SECURITY INFORMATION:
- This link expires in ${expiresIn}
- This link can only be used once
- If you didn't request this, please ignore this email
- Never share this link with anyone

If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

---
Ekosistem Sekolah - Identity Provider
This is an automated email, please do not reply.

Need help? Contact support@ekosistem-sekolah.com
  `.trim();
}
