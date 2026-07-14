import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AdminApiError,
  assertAllowedRequestOrigin,
  isAllowedRequestOrigin,
  normalizeOrigin,
} from '../lib/auth/api';
import { parseAuthEnvironment } from '../lib/auth/env';

const authEnvironment = {
  BETTER_AUTH_SECRET: 'a-secure-test-secret-with-more-than-32-characters',
  BETTER_AUTH_URL: 'https://blog.example.com/',
  ADMIN_EMAIL: 'Owner@Example.com',
  AUTH_ALLOW_SIGNUP: 'false',
  AUTH_TRUSTED_ORIGINS: 'http://localhost:3000, https://preview.example.com',
};

test('auth environment normalizes the single owner and trusted origins', () => {
  const environment = parseAuthEnvironment(authEnvironment);

  assert.equal(environment.baseUrl, 'https://blog.example.com');
  assert.equal(environment.adminEmail, 'owner@example.com');
  assert.equal(environment.allowSignUp, false);
  assert.deepEqual(environment.trustedOrigins, [
    'https://blog.example.com',
    'http://localhost:3000',
    'https://preview.example.com',
  ]);
});

test('origin checks require an exact HTTP(S) origin', () => {
  const trusted = ['https://blog.example.com'];

  assert.equal(isAllowedRequestOrigin('https://blog.example.com/path', trusted), true);
  assert.equal(isAllowedRequestOrigin('https://evil.blog.example.com', trusted), false);
  assert.equal(isAllowedRequestOrigin('https://blog.example.com.evil.test', trusted), false);
  assert.equal(normalizeOrigin('https://user:pass@blog.example.com'), null);
  assert.equal(normalizeOrigin('javascript:alert(1)'), null);
});

test('mutation origin guard rejects missing and untrusted Origin headers', () => {
  assert.throws(
    () =>
      assertAllowedRequestOrigin(
        new Request('https://blog.example.com/api/admin/media'),
        ['https://blog.example.com']
      ),
    (error: unknown) =>
      error instanceof AdminApiError && error.code === 'origin_required'
  );

  assert.throws(
    () =>
      assertAllowedRequestOrigin(
        new Request('https://blog.example.com/api/admin/media', {
          headers: { Origin: 'https://evil.example.com' },
        }),
        ['https://blog.example.com']
      ),
    (error: unknown) =>
      error instanceof AdminApiError && error.code === 'origin_not_allowed'
  );
});
