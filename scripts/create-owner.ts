import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());
process.env.AUTH_ALLOW_SIGNUP = 'true';

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

async function createOwner() {
  const email = required('ADMIN_EMAIL').toLowerCase();
  const password = required('ADMIN_BOOTSTRAP_PASSWORD');
  const name = process.env.ADMIN_NAME?.trim() || 'Magren';

  if (password.length < 12) {
    throw new Error('ADMIN_BOOTSTRAP_PASSWORD must contain at least 12 characters.');
  }

  const { getAuth } = await import('../lib/auth/server');
  const { closeDatabase } = await import('../lib/db');

  try {
    const result = await getAuth().api.signUpEmail({
      body: { email, password, name },
    });

    process.stdout.write(`Owner account created for ${result.user.email}.\n`);
    process.stdout.write(
      'Remove ADMIN_BOOTSTRAP_PASSWORD from your local environment after verifying login.\n'
    );
  } finally {
    await closeDatabase();
  }
}

createOwner().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
