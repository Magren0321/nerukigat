import { CollectionTabs } from '@/components/collection/CollectionTabs';

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto mb-20 mt-6 w-full max-w-5xl px-4 sm:px-6 lg:mt-8 lg:px-8">
      <CollectionTabs />
      {children}
    </div>
  );
}
