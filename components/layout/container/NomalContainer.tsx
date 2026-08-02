import { clsx } from 'clsx';
import React from 'react';
import { AnimateContainer } from './AnimatieContainer';
import { PageContainer } from './PageContainer';

export const NormalContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <PageContainer
      className={clsx('relative z-10 mb-20 mt-14 lg:mt-20', className)}
    >
      <AnimateContainer>{children}</AnimateContainer>
    </PageContainer>
  );
};
