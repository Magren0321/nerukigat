'use client'

import { useContext, type DetailedHTMLProps , type HTMLAttributes } from 'react'
import { HeadingMapContext } from '@/providers/post/PostProvider'

export const Heading1 = (props: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>{
  return (
    <Heading level={1}>
      {props.children}
    </Heading>
  )
}

export const Heading2 = (props: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>{
  return (
    <Heading level={2}>
      {props.children}
    </Heading>
  )
}

export const Heading3 = (props: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>{
  return (
    <Heading level={3}>
      {props.children}
    </Heading>
  )
}


export const Heading = ({
  children,
  level = 1,
}: {
  children: React.ReactNode
  level?: number
}) =>{
  
  const idMap = useContext(HeadingMapContext);

  const getId = (text: string) =>{
    const count = idMap.get(text) || 0;
    idMap.set(text,count+1);
    return count ? `${text}-${count}` : text;
  }
  
  {
    switch (level) {
      case 1:
        return <h1 className="text-3xl font-bold" id={getId(children?.toString() || '')}>{children}</h1>
      case 2:
        return <h2 className="text-2xl font-bold" id={getId(children?.toString() || '')}>{children}</h2>
      case 3:
        return <h3 className="text-xl font-bold" id={getId(children?.toString() || '')}>{children}</h3>
      default:
        return <h1 className="text-3xl font-bold" id={getId(children?.toString() || '')}>{children}</h1>
    }
  }
}
