import { NextResponse } from 'next/server';

const BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

/**
 * GET /.well-known/openid-configuration
 *
 * OpenID Connect Discovery endpoint
 * Returns OIDC Provider configuration
 */
export async function GET() {
  const config = {
    // Required fields
    issuer: BASE_URL,
    authorization_endpoint: `${BASE_URL}/api/oidc/authorize`,
    token_endpoint: `${BASE_URL}/api/oidc/token`,
    jwks_uri: `${BASE_URL}/.well-known/jwks.json`,

    // Recommended fields
    userinfo_endpoint: `${BASE_URL}/api/oidc/userinfo`,
    end_session_endpoint: `${BASE_URL}/api/oidc/logout`,

    // Supported scopes
    scopes_supported: [
      'openid',
      'profile',
      'email',
      'address',
      'phone',
      'school',
      'offline_access',
    ],

    // Supported response types
    response_types_supported: [
      'code',
      'id_token',
      'token id_token',
      'code id_token',
      'code token',
      'code token id_token',
    ],

    // Supported response modes
    response_modes_supported: ['query', 'fragment', 'form_post'],

    // Supported grant types
    grant_types_supported: ['authorization_code', 'refresh_token', 'implicit'],

    // Subject types
    subject_types_supported: ['public'],

    // Signing algorithms
    id_token_signing_alg_values_supported: ['RS256'],

    // Token endpoint auth methods
    token_endpoint_auth_methods_supported: [
      'client_secret_post',
      'client_secret_basic',
      'none', // For public clients
    ],

    // Supported claims
    claims_supported: [
      // Standard claims
      'sub',
      'iss',
      'aud',
      'exp',
      'iat',
      'auth_time',
      'nonce',
      'acr',
      'amr',
      'azp',

      // Profile scope
      'name',
      'given_name',
      'family_name',
      'middle_name',
      'nickname',
      'preferred_username',
      'profile',
      'picture',
      'website',
      'gender',
      'birthdate',
      'zoneinfo',
      'locale',
      'updated_at',

      // Email scope
      'email',
      'email_verified',

      // Address scope
      'address',

      // Phone scope
      'phone_number',
      'phone_number_verified',

      // Custom claims (school scope)
      'role',
      'school_id',
      'school_name',
      'department',
      'permissions',
    ],

    // PKCE support
    code_challenge_methods_supported: ['S256', 'plain'],

    // UI Locales
    ui_locales_supported: ['id-ID', 'en-US'],

    // Service documentation
    service_documentation: `${BASE_URL}/docs/oidc`,
    op_policy_uri: `${BASE_URL}/privacy`,
    op_tos_uri: `${BASE_URL}/terms`,
  };

  return NextResponse.json(config, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
