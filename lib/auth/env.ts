import 'server-only';

import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const authEnvironmentSchema = z
  .object({
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().trim().url(),
    ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
    AUTH_ALLOW_SIGNUP: booleanString,
    AUTH_TRUSTED_ORIGINS: z.string().trim().optional(),
  })
  .transform((environment) => {
    const configuredOrigins = environment.AUTH_TRUSTED_ORIGINS
      ? environment.AUTH_TRUSTED_ORIGINS.split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
      : [];

    return {
      secret: environment.BETTER_AUTH_SECRET,
      baseUrl: environment.BETTER_AUTH_URL.replace(/\/+$/, ''),
      adminEmail: environment.ADMIN_EMAIL,
      allowSignUp: environment.AUTH_ALLOW_SIGNUP,
      trustedOrigins: Array.from(
        new Set([
          environment.BETTER_AUTH_URL.replace(/\/+$/, ''),
          ...configuredOrigins,
        ])
      ),
    };
  });

export type AuthEnvironment = z.output<typeof authEnvironmentSchema>;

export class AuthConfigurationError extends Error {
  constructor(error: z.ZodError) {
    const details = error.issues
      .map((issue) => `${issue.path.join('.') || 'auth'}: ${issue.message}`)
      .join('; ');

    super(`Invalid authentication configuration: ${details}`);
    this.name = 'AuthConfigurationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function parseAuthEnvironment(
  source: Readonly<Record<string, string | undefined>>
): AuthEnvironment {
  const result = authEnvironmentSchema.safeParse(source);

  if (!result.success) {
    throw new AuthConfigurationError(result.error);
  }

  return result.data;
}

export function getAuthEnvironment(): AuthEnvironment {
  return parseAuthEnvironment(process.env);
}
