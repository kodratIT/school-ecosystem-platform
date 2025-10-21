/**
 * Password Reset Success Email Template
 *
 * Variables:
 * - userName: User's display name
 * - resetDate: Date and time of password reset
 * - loginUrl: Link to login page
 * - ipAddress: IP address from which reset was performed (optional)
 */

interface PasswordResetSuccessEmailProps {
  userName: string;
  resetDate: string;
  loginUrl: string;
  ipAddress?: string;
}

export function PasswordResetSuccessEmail({
  userName,
  resetDate,
  loginUrl,
  ipAddress,
}: PasswordResetSuccessEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
              <div style="width: 64px; height: 64px; margin: 0 auto 16px auto; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; color: #ffffff;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Password Reset Successful</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 24px;">
                Hello <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 24px;">
                Your password has been successfully reset for your Ekosistem Sekolah account.
              </p>
              
              <!-- Success Box -->
              <div style="background-color: #d1fae5; border-left: 4px solid: #10b981; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 20px;">
                  <strong>✓ Password changed on ${resetDate}</strong>
                </p>
                ${
                  ipAddress
                    ? `<p style="margin: 8px 0 0 0; color: #065f46; font-size: 14px; line-height: 20px;">
                  From IP address: <code style="background-color: rgba(0, 0, 0, 0.1); padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace;">${ipAddress}</code>
                </p>`
                    : ''
                }
              </div>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 24px;">
                You can now login with your new password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Go to Login
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 0 0 16px 0; border-radius: 4px;">
                <p style="margin: 0 0 12px 0; color: #991b1b; font-weight: 600; font-size: 14px;">
                  ⚠️ Didn't change your password?
                </p>
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                  If you didn't make this change, your account may be compromised. Please contact support immediately to secure your account.
                </p>
              </div>
              
              <!-- Security Tips -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px;">
                <p style="margin: 0 0 12px 0; color: #1e40af; font-weight: 600; font-size: 14px;">
                  🔒 Security Tips:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 20px;">
                  <li>Use a strong, unique password</li>
                  <li>Never share your password with anyone</li>
                  <li>Enable two-factor authentication if available</li>
                  <li>Review your account activity regularly</li>
                </ul>
              </div>
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

// Plain text version
export function PasswordResetSuccessEmailPlainText({
  userName,
  resetDate,
  loginUrl,
  ipAddress,
}: PasswordResetSuccessEmailProps): string {
  return `
Hello ${userName},

Your password has been successfully reset for your Ekosistem Sekolah account.

✓ Password changed on ${resetDate}
${ipAddress ? `From IP address: ${ipAddress}` : ''}

You can now login with your new password:
${loginUrl}

⚠️ DIDN'T CHANGE YOUR PASSWORD?
If you didn't make this change, your account may be compromised. Please contact support immediately to secure your account.

SECURITY TIPS:
- Use a strong, unique password
- Never share your password with anyone
- Enable two-factor authentication if available
- Review your account activity regularly

---
Ekosistem Sekolah - Identity Provider
This is an automated email, please do not reply.

Need help? Contact support@ekosistem-sekolah.com
  `.trim();
}
