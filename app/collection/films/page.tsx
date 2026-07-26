import { CollectionPage } from '@/components/collection/CollectionPage';
import { filmRecords } from '@/data/collections/films';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "影视记录 | Magren's Blog",
  description: '记录看过、正在看和准备看的电影、动画与剧集。',
};

export default function FilmsPage() {
  return (
    <CollectionPage
      kind="films"
      icon="icon-[ph--film-slate]"
      title="影视记录"
      intro="记录看过、正在看和准备看的电影、动画与剧集。"
      statusLabels={{
        done: '已看',
        active: '正在看',
        planned: '想看',
      }}
      records={filmRecords}
    />
  );
}
