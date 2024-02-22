import { DialogContext } from '@/providers/dialog/DialogProvider';
import Link from 'next/link';
import * as React from 'react';

const navigationItems = [
  {
    href: '/',
    text: '首页',
  },
  {
    href: '/posts',
    text: '博客',
  },
  {
    href: '/archive',
    text: '归档',
  },
  {
    href: '/friends',
    text: '友链',
  },
  {
    href: '/about',
    text: '关于',
  },
];

export const Navigation = () => {
  const { updateIsOpen } = React.useContext(DialogContext);

  return (
    <div className="mx-5 mt-[calc(1.25rem-3px)] dark:text-zinc-200">
      <div className="text-xl font-bold">站内导航</div>
      <ul className="mt-10 flex flex-col">
        {navigationItems.map(({ href, text }) => (
          <Link
            href={href}
            key={href}
            onClick={updateIsOpen}
            className="mb-7 border-b-2 border-dashed pb-2 text-lg font-semibold "
          >
            {text}
          </Link>
        ))}
      </ul>
    </div>
  );
};
