import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import { AnimateContainer } from './AnimatieContainer';
import { PageContainer } from './PageContainer';

interface SplitPageContainerProps extends HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
}

export function SplitPageContainer({
  children,
  className,
  animated = true,
  ...props
}: SplitPageContainerProps) {
  return (
    <PageContainer
      className={clsx(
        'pb-20 pt-[var(--split-top-gap)]',
        '[--split-top-gap:3.5rem] lg:[--split-top-gap:5.25rem]',
        '[--split-sticky-top:calc(var(--site-header-height)+var(--split-top-gap))]',
        className
      )}
      {...props}
    >
      {animated ? <AnimateContainer>{children}</AnimateContainer> : children}
    </PageContainer>
  );
}

export function SplitLayout({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        // Keep the sidebar aligned with the site header and cap the reading column.
        'grid grid-cols-1 gap-10 lg:grid-cols-[18rem_minmax(0,48rem)] lg:gap-14 xl:gap-16',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SplitSidebar({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={clsx(
        'min-w-0 self-start lg:sticky lg:top-[var(--split-sticky-top)]',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}
