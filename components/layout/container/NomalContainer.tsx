import { clsx } from 'clsx'
import React from 'react'
import { AnimateContainer } from './AnimatieContainer'


export const NormalContainer = ( { children } : {children: React.ReactNode} ) => {
  return (
    <div
      className={clsx(
        'mx-auto mt-14 max-w-3xl px-4 lg:mt-[80px] lg:px-0 mb-[80px] relative z-10'
      )}
    >
      <AnimateContainer>
        {children}
      </AnimateContainer>
    </div>
  )
}
