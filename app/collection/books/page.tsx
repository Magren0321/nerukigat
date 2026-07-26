import { CollectionPage } from '@/components/collection/CollectionPage';
import { bookRecords } from '@/data/collections/books';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "书籍记录 | Magren's Blog",
  description: '记录读过、正在读和还没读的书。',
};

export default function BooksPage() {
  return (
    <CollectionPage
      kind="books"
      icon="icon-[ph--book-open-text]"
      title="书籍记录"
      intro="记录读过、正在读和还没读的书。"
      statusLabels={{
        done: '已读',
        active: '正在读',
        planned: '未读',
      }}
      records={bookRecords}
    />
  );
}
