'use client';

import { Spinner } from '@/components/ui/spinner';
import clsx from 'clsx';
import type { ImageProps } from 'next/image';
import NextImage from 'next/image';
import type { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
import { useState } from 'react';
import { PhotoProvider, PhotoView } from './PreviewImage';

export const Image = (
  props: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
) => {
  const [isReady, setIsReady] = useState(false);
  return (
    <span className="relative block">
      <PhotoProvider>
        <PhotoView src={props.src}>
          <NextImage
            {...(props as ImageProps)}
            priority
            alt={props.alt ?? ''}
            layout="responsive"
            width={100}
            height={100}
            onLoad={() => setIsReady(true)}
            onError={() => setIsReady(false)}
            className={clsx(
              'rounded-xl opacity-0 transition-opacity duration-500',
              isReady && 'opacity-100'
            )}
          />
        </PhotoView>
      </PhotoProvider>
      {!isReady && <Spinner />}
      {props.alt && (
        <span className="mb-8 block text-center italic">◭ {props.alt}</span>
      )}
    </span>
  );
};
