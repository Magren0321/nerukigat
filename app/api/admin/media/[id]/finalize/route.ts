import { requireOwnerApi } from '@/lib/auth/api';
import { finalizeMediaUpload, mediaApiErrorResponse } from '@/lib/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwnerApi(request);
    const { id } = await context.params;
    const asset = await finalizeMediaUpload(id);

    return Response.json(
      { data: { asset } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return mediaApiErrorResponse(error);
  }
}
