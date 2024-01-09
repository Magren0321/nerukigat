import React from 'react'

export const PostContainer = ({ children } : {
  children: React.ReactNode
}) => {
  return (
    <div className="container m-auto mt-[80px] max-w-6xl px-2 md:px-6 lg:p-0">
      {children}
    </div>
  )
}
