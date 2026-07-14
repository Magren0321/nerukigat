import { MediaLibrary } from '@/components/admin/media/MediaLibrary';
import { requireOwner } from '@/lib/auth';
import {
  getMediaStorageReadiness,
  listActiveMedia,
} from '@/lib/media';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  await requireOwner();
  const storageReadiness = getMediaStorageReadiness();
  const media = await listActiveMedia();

  return (
    <MediaLibrary
      initialMedia={media}
      storageReadiness={storageReadiness}
    />
  );
}
