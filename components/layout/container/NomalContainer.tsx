import { clsx } from 'clsx';
import React from 'react';
import { AnimateContainer } from './AnimatieContainer';

export const NormalContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className={clsx(
        'relative z-10 mx-auto mb-[80px] mt-14 max-w-3xl px-4 lg:mt-[80px] lg:px-0'
      )}
    >
      <AnimateContainer>{children}</AnimateContainer>
    </div>
  );
};
