import { CollectionPage } from '@/components/collection/CollectionPage';
import { filmRecords } from '@/data/collections/films';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Film | Magren's Blog",
  description: '敬那些勇于追梦的愚人。 ——《爱乐之城》',
};

export default function FilmsPage() {
  return (
    <CollectionPage
      kind="films"
      icon="icon-[ph--film-slate]"
      title="Film"
      intro="敬那些勇于追梦的愚人。 ——《爱乐之城》"
      statusLabels={{
        done: '已看',
        active: '正在看',
        planned: '想看',
      }}
      records={filmRecords}
    />
  );
}
