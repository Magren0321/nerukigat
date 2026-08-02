import { PageContainer } from '@/components/layout/container/PageContainer';

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageContainer className="mt-5 lg:mt-7">{children}</PageContainer>;
}
