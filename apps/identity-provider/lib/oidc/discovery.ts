/**
 * Get OIDC discovery document
 */
export async function getDiscoveryDocument() {
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/.well-known/openid-configuration`);

  if (!response.ok) {
    throw new Error('Failed to fetch discovery document');
  }

  return response.json();
}

/**
 * Get JWKS
 */
export async function getJWKS() {
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/.well-known/jwks.json`);

  if (!response.ok) {
    throw new Error('Failed to fetch JWKS');
  }

  return response.json();
}

/**
 * Validate discovery document
 */
export function validateDiscoveryDocument(
  doc: Record<string, unknown>
): boolean {
  const requiredFields = [
    'issuer',
    'authorization_endpoint',
    'token_endpoint',
    'jwks_uri',
    'response_types_supported',
    'subject_types_supported',
    'id_token_signing_alg_values_supported',
  ];

  for (const field of requiredFields) {
    if (!doc[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  return true;
}
