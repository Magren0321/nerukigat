'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname} from 'next/navigation'
import { motion , useMotionValue , useMotionTemplate} from 'framer-motion'
import React from 'react'

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

function NavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const isActive = usePathname() === href

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'relative block whitespace-nowrap px-3 py-2 transition',
          isActive
            ? 'text-blue-600 dark:text-blue-600'
            : 'hover:text-blue-700 dark:hover:text-blue-700'
        )}
      >
        {children}
        {isActive && (
          <motion.span
            className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-lime-700/0 via-blue-700/70 to-blue-700/0 dark:from-lime-400/0 dark:via-blue-400/40 dark:to-blue-400/0"
            layoutId="active-nav-item"
          />
        )}
      </Link>
    </li>
  )
}

const Nav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) =>{
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const radius = useMotionValue(0)
  const handleMouseMove = React.useCallback(
    ({ clientX, clientY, currentTarget }: React.MouseEvent) => {
      const bounds = currentTarget.getBoundingClientRect()
      mouseX.set(clientX - bounds.left)
      mouseY.set(clientY - bounds.top)
      radius.set(Math.sqrt(bounds.width ** 2 + bounds.height ** 2) / 2.5)
    },
    [mouseX, mouseY, radius]
  )

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, var(--spotlight-color) 0%, transparent 65%)`

  return (
    <nav
      onMouseMove={handleMouseMove}
      className={clsx(
        'group relative transition-all duration-500',
        'rounded-full w-fit mx-auto',
        '[--spotlight-color:rgb(96_165_250_/_0.2)] dark:[--spotlight-color:rgb(96_165_250_/_0.09)]',
        className
      )}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background }}
        aria-hidden="true"
      />

      <ul className="flex bg-transparent px-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 ">
        {navigationItems.map(({ href, text }) => (
          <NavItem key={href} href={href}>
            {text}
          </NavItem>
        ))}
      </ul>
    </nav>
  )
}

export const NavigationBar = ({ className }: React.HTMLAttributes<HTMLDivElement>) =>{
  return (
    <Nav className={className}/>
  )
}

