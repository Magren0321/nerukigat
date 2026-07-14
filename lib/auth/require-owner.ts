import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getAuthEnvironment } from './env';
import { getAuth } from './server';

export async function getOwnerSession() {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    session.user.email.toLowerCase() !== getAuthEnvironment().adminEmail
  ) {
    return null;
  }

  return session;
}

export async function requireOwner() {
  const session = await getOwnerSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}
