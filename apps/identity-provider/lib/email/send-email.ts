/**
 * Email Service
 *
 * Abstract email sending with support for multiple providers
 * Currently configured for console logging (development)
 *
 * To enable actual email sending:
 * 1. Install email provider SDK (e.g., resend, @sendgrid/mail)
 * 2. Add API keys to .env.local
 * 3. Implement provider-specific logic below
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, html, text, from } = options;
  const fromAddress =
    from || process.env.EMAIL_FROM || 'noreply@ekosistem-sekolah.com';

  try {
    // Check which email provider is configured
    const provider = process.env.EMAIL_PROVIDER || 'console';

    switch (provider) {
      case 'resend':
        return await sendWithResend({
          to,
          from: fromAddress,
          subject,
          html,
          text,
        });

      case 'sendgrid':
        return await sendWithSendGrid({
          to,
          from: fromAddress,
          subject,
          html,
          text,
        });

      case 'smtp':
        return await sendWithSMTP({
          to,
          from: fromAddress,
          subject,
          html,
          text,
        });

      case 'console':
      default:
        // Development: Log to console
        console.log('📧 Email would be sent:', {
          to,
          from: fromAddress,
          subject,
          htmlLength: html.length,
          textLength: text?.length,
        });
        console.log(
          '📧 Email HTML Preview (first 200 chars):',
          html.substring(0, 200)
        );
        return {
          success: true,
          messageId: `dev-${Date.now()}`,
        };
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email using Resend
 * Requires: npm install resend
 * Env: RESEND_API_KEY
 */
async function sendWithResend(_options: EmailOptions): Promise<EmailResult> {
  try {
    // Uncomment when resend is installed:
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const data = await resend.emails.send({
    //   from: options.from,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });
    // return { success: true, messageId: data.id };

    throw new Error(
      'Resend not configured. Install resend package and set RESEND_API_KEY.'
    );
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Resend error',
    };
  }
}

/**
 * Send email using SendGrid
 * Requires: npm install @sendgrid/mail
 * Env: SENDGRID_API_KEY
 */
async function sendWithSendGrid(_options: EmailOptions): Promise<EmailResult> {
  try {
    // Uncomment when @sendgrid/mail is installed:
    // const sgMail = await import('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    // const [response] = await sgMail.send({
    //   to: options.to,
    //   from: options.from,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });
    // return { success: true, messageId: response.headers['x-message-id'] };

    throw new Error(
      'SendGrid not configured. Install @sendgrid/mail and set SENDGRID_API_KEY.'
    );
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SendGrid error',
    };
  }
}

/**
 * Send email using SMTP (Nodemailer)
 * Requires: npm install nodemailer
 * Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */
async function sendWithSMTP(_options: EmailOptions): Promise<EmailResult> {
  try {
    // Uncomment when nodemailer is installed:
    // const nodemailer = await import('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: parseInt(process.env.SMTP_PORT || '587'),
    //   secure: process.env.SMTP_SECURE === 'true',
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    // const info = await transporter.sendMail({
    //   from: options.from,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });
    // return { success: true, messageId: info.messageId };

    throw new Error(
      'SMTP not configured. Install nodemailer and set SMTP_* environment variables.'
    );
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMTP error',
    };
  }
}

/**
 * Helper to send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetUrl: string
): Promise<EmailResult> {
  const { PasswordResetRequestEmail, PasswordResetRequestEmailPlainText } =
    await import('./templates/password-reset-request');

  return sendEmail({
    to,
    subject: 'Reset Your Password - Ekosistem Sekolah',
    html: PasswordResetRequestEmail({ userName, resetUrl }),
    text: PasswordResetRequestEmailPlainText({ userName, resetUrl }),
  });
}

/**
 * Helper to send password reset confirmation email
 */
export async function sendPasswordResetSuccessEmail(
  to: string,
  userName: string,
  loginUrl: string,
  ipAddress?: string
): Promise<EmailResult> {
  const { PasswordResetSuccessEmail, PasswordResetSuccessEmailPlainText } =
    await import('./templates/password-reset-success');

  const resetDate = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return sendEmail({
    to,
    subject: 'Password Reset Successful - Ekosistem Sekolah',
    html: PasswordResetSuccessEmail({
      userName,
      resetDate,
      loginUrl,
      ipAddress,
    }),
    text: PasswordResetSuccessEmailPlainText({
      userName,
      resetDate,
      loginUrl,
      ipAddress,
    }),
  });
}
