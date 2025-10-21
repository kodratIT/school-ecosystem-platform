import { SSOClient } from './index';

/**
 * Handle SSO callback in Service Provider
 */
export async function handleSSOCallback(
  code: string,
  ssoClient: SSOClient
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  try {
    // Exchange code for tokens
    const tokens = await ssoClient.exchangeCode(code);

    // Verify the access token
    const payload = await ssoClient.verifyToken(tokens.accessToken);

    console.log('SSO login successful:', payload.email);

    return tokens;
  } catch (error) {
    console.error('SSO callback error:', error);
    throw error;
  }
}
