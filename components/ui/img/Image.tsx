'use client'

import type { ImageProps } from 'next/image'
import type { DetailedHTMLProps, ImgHTMLAttributes } from 'react'
import clsx from 'clsx'
import NextImage from 'next/image'
import { useState } from 'react'
import { PhotoView,PhotoProvider } from './PreviewImage'
import { Spinner } from '@/components/ui/spinner'

export const Image = (props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
  const [isReady, setIsReady] = useState(false)
  return (
    <span className='relative block'>
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
              className={clsx('opacity-0 transition-opacity duration-500 rounded-xl', isReady && 'opacity-100')}
            />
        </PhotoView>
      </PhotoProvider>
      {
        !isReady && <Spinner />
      }
      {props.alt && <span className="mb-8 block text-center italic">◭ {props.alt}</span>}
    </span>
  )
}
