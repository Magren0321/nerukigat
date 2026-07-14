import 'server-only';

import { AdminApiError } from '@/lib/auth/api';
import { StorageConfigurationError } from '@/lib/env/storage';
import { StorageValidationError } from '@/lib/storage/s3';

import { MediaError } from './errors';

export function mediaApiErrorResponse(error: unknown): Response {
  if (error instanceof AdminApiError || error instanceof MediaError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (error instanceof StorageConfigurationError) {
    return Response.json(
      {
        error: {
          code: 'storage_unavailable',
          message: '媒体存储尚未配置完成。',
        },
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (error instanceof StorageValidationError) {
    const status =
      error.code === 'private_bucket_not_configured' ? 503 : 422;

    return Response.json(
      {
        error: {
          code:
            status === 503 ? 'storage_unavailable' : 'upload_validation_failed',
          message:
            status === 503
              ? '媒体存储尚未配置私有上传桶。'
              : '上传对象未通过服务端校验。',
        },
      },
      { status, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return Response.json(
    {
      error: {
        code: 'internal_error',
        message: '媒体请求处理失败，请稍后重试。',
      },
    },
    { status: 500, headers: { 'Cache-Control': 'no-store' } }
  );
}

export function publicMediaRedirect(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      'Cache-Control':
        'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
