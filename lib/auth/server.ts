import 'server-only';

import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';

import {
  account,
  session,
  user,
  verification,
} from '@/db/schema';
import { getDatabase } from '@/lib/db';

import { getAuthEnvironment } from './env';

const authSchema = {
  user,
  session,
  account,
  verification,
};

const authGlobals = globalThis as typeof globalThis & {
  __nerukigatAuth?: ReturnType<typeof createAuth>;
};

function createAuth() {
  const environment = getAuthEnvironment();

  return betterAuth({
    appName: 'Nerukigat',
    baseURL: environment.baseUrl,
    secret: environment.secret,
    trustedOrigins: environment.trustedOrigins,
    database: drizzleAdapter(getDatabase(), {
      provider: 'pg',
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !environment.allowSignUp,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (candidate) => {
            if (candidate.email.toLowerCase() !== environment.adminEmail) {
              return false;
            }

            return { data: candidate };
          },
        },
      },
    },
    advanced: {
      database: {
        generateId: 'uuid',
      },
      useSecureCookies: environment.baseUrl.startsWith('https://'),
    },
  });
}

/**
 * Authentication is initialized only for an auth/admin request. Importing this
 * module does not require database or auth environment variables, so the
 * Contentlayer-backed public site remains buildable during migration.
 */
export function getAuth() {
  if (authGlobals.__nerukigatAuth) {
    return authGlobals.__nerukigatAuth;
  }

  const auth = createAuth();

  if (process.env.NODE_ENV !== 'production') {
    authGlobals.__nerukigatAuth = auth;
  }

  return auth;
}

export type Auth = ReturnType<typeof createAuth>;
