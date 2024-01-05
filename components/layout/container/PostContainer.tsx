import React from 'react'

export const PostContainer = ({ children } : {
  children: React.ReactNode
}) => {
  return (
    <div className="container m-auto mt-[120px] max-w-7xl px-2 md:px-6 lg:p-0">
      {children}
    </div>
  )
}
