import * as React from "react"

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
    href: '/about',
    text: '关于'
  },
]

export const Navigation = () => (
  <div className="mt-[calc(1.25rem-5px)] ml-5">
    <div className="font-bold text-xl">站内导航</div>
    <ul className="flex flex-col mt-10">
      {
        navigationItems.map(({ href, text }) => (
          <Link href={href} key={href}>
            {text}
          </Link>
        ))
      }
    </ul>
  </div>
);

