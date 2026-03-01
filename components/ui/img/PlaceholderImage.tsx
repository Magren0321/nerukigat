/* eslint-disable @next/next/no-img-element */
'use client'

import clsx from "clsx"
import { useCallback, useState } from 'react';
export const PlaceholderImage = ({
  link,
  alt,
  className,
}:{
  link: string,
  alt: string,
  className?: string,
}) => {

  const [isReady, setIsReady] = useState(false);

  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete) {
      setIsReady(true);
    }
  }, []);

  return (
    <>
      <img
        className={clsx(
          'rounded-lg opacity-0 transition-opacity duration-500',
          isReady && 'opacity-100',
          className
        )}
        src={link}
        ref={imgRef}
        alt={alt}
        onLoad={() => setIsReady(true)}
        onError={() => setIsReady(false)}
      />
      {!isReady && (
        <div className={clsx(
          `dark:bg-zinc-800 absolute left-3 top-4 animate-pulse rounded-lg bg-zinc-300`,
          className
        )}></div>
      )}
    </>
  )
}
