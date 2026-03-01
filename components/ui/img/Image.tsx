'use client';

import { Spinner } from '@/components/ui/spinner';
import clsx from 'clsx';
import type { ImageProps } from 'next/image';
import NextImage from 'next/image';
import type { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
import { useState } from 'react';
import { PhotoView } from './PreviewImage';

export const Image = (
  props: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
) => {
  const [isReady, setIsReady] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const width = typeof props.width === 'number' ? props.width : 1200;
  const height = typeof props.height === 'number' ? props.height : 800;

  return (
    <span className="relative block">
      <PhotoView src={typeof props.src === 'string' ? props.src : undefined}>
        <NextImage
          {...(props as ImageProps)}
          alt={props.alt ?? ''}
          width={width}
          height={height}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          onLoad={(e) => {
            const img = e.currentTarget;
            setIsPortrait(img.naturalHeight > img.naturalWidth);
            setIsReady(true);
          }}
          onError={() => setIsReady(false)}
          className={clsx(
            'h-auto w-full rounded-xl opacity-0 transition-opacity duration-500',
            isPortrait ? 'md:max-w-[450px] md:mx-auto' : 'md:max-w-[650px] md:mx-auto',
            isReady && 'opacity-100'
          )}
          loading="lazy"
        />
      </PhotoView>
      {!isReady && <Spinner />}
      {props.alt && (
        <span className="mb-8 block text-center italic">◭ {props.alt}</span>
      )}
    </span>
  );
};
