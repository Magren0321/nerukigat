import { SplitPageContainer } from '@/components/layout/container/SplitPageLayout';

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SplitPageContainer animated={false}>
      {children}
    </SplitPageContainer>
  );
}
