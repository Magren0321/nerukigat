import 'server-only';

import { getAuthEnvironment } from './env';
import { getAuth } from './server';

export type AdminApiErrorCode =
  | 'unauthorized'
  | 'origin_required'
  | 'origin_not_allowed';

export class AdminApiError extends Error {
  constructor(
    readonly code: AdminApiErrorCode,
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'AdminApiError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);

    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      url.username ||
      url.password ||
      url.origin === 'null'
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function isAllowedRequestOrigin(
  origin: string,
  trustedOrigins: readonly string[]
): boolean {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return false;
  }

  return trustedOrigins.some(
    (candidate) => normalizeOrigin(candidate) === normalizedOrigin
  );
}

export function assertAllowedRequestOrigin(
  request: Pick<Request, 'headers'>,
  trustedOrigins: readonly string[]
): void {
  const origin = request.headers.get('origin');

  if (!origin) {
    throw new AdminApiError(
      'origin_required',
      403,
      'This request requires a same-site Origin header'
    );
  }

  if (!isAllowedRequestOrigin(origin, trustedOrigins)) {
    throw new AdminApiError(
      'origin_not_allowed',
      403,
      'The request Origin is not allowed'
    );
  }
}

/**
 * Route-handler guard for owner-only mutations. It returns JSON-friendly
 * errors instead of using the redirecting admin page guard.
 */
export async function requireOwnerApi(request: Request) {
  const environment = getAuthEnvironment();
  assertAllowedRequestOrigin(request, environment.trustedOrigins);

  const session = await getAuth().api.getSession({ headers: request.headers });

  if (
    !session ||
    session.user.email.toLowerCase() !== environment.adminEmail
  ) {
    throw new AdminApiError('unauthorized', 401, 'Owner session required');
  }

  return session;
}
