import React from 'react'
import { AnimateContainer } from './AnimatieContainer'

export const PostContainer = ({ children } : {
  children: React.ReactNode
}) => {
  return (
    <div className="container m-auto mt-[40px] mb-[120px] max-w-5xl px-2 md:px-6 lg:p-0 lg:mt-[80px]">
      <AnimateContainer>
        {children}
      </AnimateContainer>
    </div>
  )
}
