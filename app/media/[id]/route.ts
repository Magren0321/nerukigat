import {
  publicMediaRedirect,
  resolveActiveMediaUrl,
} from '@/lib/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = await resolveActiveMediaUrl(id);

    if (!url) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'Cache-Control': 'public, max-age=60' },
      });
    }

    return publicMediaRedirect(url);
  } catch {
    return new Response('Media temporarily unavailable', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
