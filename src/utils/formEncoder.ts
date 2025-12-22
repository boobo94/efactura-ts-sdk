import qs from 'qs';
import { tryCatch } from '../tryCatch';

/**
 * Form encoding utilities for ANAF e-Factura SDK
 *
 * Provides consistent form encoding for OAuth and other
 * form-based API requests.
 */

/**
 * Encode object as application/x-www-form-urlencoded string
 * @param data Object to encode
 * @returns Encoded form string
 */
export function encodeForm(data: Record<string, string | number | boolean>): string {
  return qs.stringify(data, { encode: true });
}

/**
 * Build query string from object
 * @param obj Object to convert to query string
 * @returns Query string (without leading ?)
 */
export function buildQueryString(obj: Record<string, unknown>): string {
  return qs.stringify(obj, {
    encode: true,
    arrayFormat: 'repeat',
    skipNulls: true,
  });
}

/**
 * Encode OAuth token request data
 * @param params OAuth parameters
 * @returns Encoded form data
 */
export function encodeOAuthTokenRequest(params: {
  grant_type: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  code?: string;
  refresh_token?: string;
  token_content_type?: string;
}): string {
  const data: Record<string, string> = {
    grant_type: params.grant_type,
    client_id: params.client_id,
    client_secret: params.client_secret,
    redirect_uri: params.redirect_uri,
  };

  if (params.code) {
    data.code = params.code;
  }

  if (params.refresh_token) {
    data.refresh_token = params.refresh_token;
  }

  if (params.token_content_type) {
    data.token_content_type = params.token_content_type;
  }

  return encodeForm(data);
}

/**
 * Build OAuth authorization URL
 * @param baseUrl Authorization endpoint base URL
 * @param params Authorization parameters
 * @returns Complete authorization URL
 */
export function buildOAuthAuthorizationUrl(
  baseUrl: string,
  params: {
    client_id: string;
    response_type: string;
    redirect_uri: string;
    scope?: string;
    token_content_type?: string;
    state?: { [x: string]: any };
  }
): string {
  const queryParams = new URLSearchParams();

  queryParams.append('client_id', params.client_id);
  queryParams.append('response_type', params.response_type);
  queryParams.append('redirect_uri', params.redirect_uri);

  if (params.scope) {
    queryParams.append('scope', params.scope);
  }

  if (params.token_content_type) {
    queryParams.append('token_content_type', params.token_content_type);
  }

  if (params.state) {
    queryParams.append('state', encodeOAuthState(params.state));
  }

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Encode OAuth state as base64 to ensure safe transport through query params
 */
export function encodeOAuthState(state: Record<string, any>): string {
  return Buffer.from(JSON.stringify(state), 'utf8').toString('base64');
}

/**
 * Decode base64-encoded OAuth state back to its original object
 */
export function decodeOAuthState<T = Record<string, any>>(encodedState: string): T {
  return JSON.parse(Buffer.from(encodedState, 'base64').toString('utf8'));
}

/**
 * Extract OAuth code from redirect URL
 * @param redirectUrl Full redirect URL containing code parameter
 * @returns Authorization code or null if not found
 */
export function extractOAuthCode(redirectUrl: string): string | null {
  const { data: code } = tryCatch(() => {
    const url = new URL(redirectUrl);
    return url.searchParams.get('code');
  });

  return code;
}

/**
 * Extract OAuth error from redirect URL
 * @param redirectUrl Full redirect URL that might contain error
 * @returns Error information or null if no error
 */
export function extractOAuthError(redirectUrl: string): { error: string; error_description?: string } | null {
  const { data: error } = tryCatch(() => {
    const url = new URL(redirectUrl);
    return url.searchParams.get('error');
  });

  const { data: error_description } = tryCatch(() => {
    const url = new URL(redirectUrl);
    return url.searchParams.get('error_description');
  });

  return { error: error || '', error_description: error_description || undefined };
}
