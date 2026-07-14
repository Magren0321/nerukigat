import { requireOwnerApi } from '@/lib/auth/api';
import { mediaApiErrorResponse, presignMediaUpload } from '@/lib/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_JSON_BYTES = 16 * 1024;
const noStoreHeaders = { 'Cache-Control': 'no-store' };

function requestError(status: number, message: string) {
  return Response.json(
    { error: { code: 'invalid_request', message } },
    { status, headers: noStoreHeaders }
  );
}

async function readLimitedJson(request: Request): Promise<unknown> {
  if (!request.body) throw new SyntaxError('Request body is empty');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;

    if (receivedBytes > MAX_JSON_BYTES) {
      await reader.cancel();
      throw new RangeError('Request body is too large');
    }
    chunks.push(value);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function POST(request: Request) {
  try {
    await requireOwnerApi(request);

    const mediaType = request.headers
      .get('content-type')
      ?.split(';', 1)[0]
      .trim()
      .toLowerCase();
    if (mediaType !== 'application/json') {
      return requestError(415, '请求必须使用 JSON 格式。');
    }

    const declaredLength = Number(request.headers.get('content-length') ?? 0);

    if (declaredLength > MAX_JSON_BYTES) {
      return requestError(413, '请求内容过大。');
    }

    let payload: unknown;
    try {
      payload = await readLimitedJson(request);
    } catch (error) {
      if (error instanceof RangeError) {
        return requestError(413, '请求内容过大。');
      }
      return requestError(400, '请求 JSON 无效。');
    }

    const result = await presignMediaUpload(payload);
    return Response.json(
      { data: result },
      { status: 201, headers: noStoreHeaders }
    );
  } catch (error) {
    return mediaApiErrorResponse(error);
  }
}
