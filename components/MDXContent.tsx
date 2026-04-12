'use client';

import { Heading1, Heading2, Heading3 } from '@/components/ui/heading/Heading';
import { Image } from '@/components/ui/img/Image';
import { useMDXComponent } from 'next-contentlayer2/hooks';

export const MDXContent = ({ code }: { code: string }) => {
  const Component = useMDXComponent(code);
  return (
    // eslint-disable-next-line react-hooks/static-components
    <Component
      components={{
        img: Image,
        h1: Heading1,
        h2: Heading2,
        h3: Heading3,
      }}
    />
  );
};
