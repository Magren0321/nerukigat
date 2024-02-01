'use client'

import { NavigationBar } from "./NavigationBar"
import { Dialog } from "@/components/ui/dialog/Dialog"
import { Navigation } from "@/components/layout/header/TabNavigation"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence , motion } from "framer-motion"
import { useEffect, useState } from "react"

import clsx from "clsx"

export const Header = () =>{

  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    setIsShow(window.scrollY > 80);
    const handleScroll = () => {
      setIsShow(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  },[])


  return (
    <div className="sticky top-0 z-[999]">
      <div className={clsx(
        'py-2 w-full  px-5 transition-all duration-5000',
        isShow ? 'filter-bg' : '',
      )}>
        <div className="flex justify-center items-center max-w-4xl mx-auto">
          <Link href='/' className="mr-auto">
            <Image src={'/avatar.png'} width={40} height={40} alt='avatar' className="rounded-full"/>
          </Link>
          <div className="flex-1 ml-[-40px] hidden lg:block">
            <NavigationBar className={ !isShow ? 'filter-bg' : '' } />
          </div>
        </div>
      </div>
      <div className="lg:hidden ml-auto fixed top-5 right-5">
        <Dialog>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5  }}
            >
              <Navigation/>
            </motion.div>
          </AnimatePresence>
        </Dialog>
      </div>
    </div>
  )
}
