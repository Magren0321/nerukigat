import { CollectionPage } from '@/components/collection/CollectionPage';
import { bookRecords } from '@/data/collections/books';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Book | Magren's Blog",
  description: '知识可以传授，智慧却不能。《悉达多》',
};

export default function BooksPage() {
  return (
    <CollectionPage
      kind="books"
      icon="icon-[ph--book-open-text]"
      label="Books"
      title="书籍"
      intro="知识可以传授，智慧却不能。"
      source="《悉达多》"
      statusLabels={{
        done: '已读',
        active: '正在读',
        planned: '未读',
      }}
      records={bookRecords}
    />
  );
}
