export type MediaErrorCode =
  | 'invalid_request'
  | 'unsupported_media_type'
  | 'upload_too_large'
  | 'media_not_found'
  | 'media_state_conflict'
  | 'storage_unavailable'
  | 'invalid_image'
  | 'image_too_large'
  | 'animated_image_not_supported';

export class MediaError extends Error {
  constructor(
    readonly code: MediaErrorCode,
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'MediaError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
