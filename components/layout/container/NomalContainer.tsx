import { clsx } from 'clsx'
import React from 'react'

export const NormalContainer = ( { children } : {children: React.ReactNode} ) => {

  return (
    <div
      className={clsx(
        'mx-auto mt-14 max-w-3xl px-2 lg:mt-[80px] lg:px-0 2xl:max-w-4xl',
        '[&_header.prose]:mb-[80px]',
      )}
    >
      {children}

    </div>
  )
}
