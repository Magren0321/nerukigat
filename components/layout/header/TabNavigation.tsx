import * as React from "react"
import { DialogContext } from "@/providers/dialog/DialogProvider";
import Link from 'next/link'


const navigationItems = [
  {
    href: '/',
    text: '首页'
  },
  {
    href: '/posts',
    text: '博客'
  },
  {
    href: '/archive',
    text: '归档'
  },
  {
    href: '/friends',
    text: '友链'
  },
  {
    href: '/about',
    text: '关于'
  },
]

export const Navigation = () => {
  const {
    updateIsOpen
  } = React.useContext(DialogContext);
  
  return (
    <div className="mt-[calc(1.25rem-3px)] mx-5 dark:text-zinc-200">
    <div className="font-bold text-xl">站内导航</div>
    <ul className="flex flex-col mt-10">
      {
        navigationItems.map(({ href, text }) => (
          <Link href={href} key={href} onClick={updateIsOpen} className="mb-7 font-semibold text-lg border-dashed border-b-2 pb-2 ">
            {text}
          </Link>
        ))
      }
    </ul>
  </div>
  )
}

