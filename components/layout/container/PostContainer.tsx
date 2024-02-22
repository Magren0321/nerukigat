import React from 'react';
import { AnimateContainer } from './AnimatieContainer';

export const PostContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container m-auto mb-[120px] mt-[40px] max-w-5xl px-4 lg:mt-[80px] lg:p-0">
      <AnimateContainer>{children}</AnimateContainer>
    </div>
  );
};
