'use client'

import { NavigationBar } from "./NavigationBar"
import Image from "next/image"
import { useEffect, useState } from "react"
import clsx from "clsx"

export const Header = () =>{

  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsShow(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  },[])


  return (
    <div className={clsx(
      'py-2 sticky top-0 z-[999] px-5 transition-all duration-5000',
      isShow ? 'filter-bg' : '',
    )}>
      <div className="flex justify-center items-center max-w-4xl mx-auto">
        <Image src={'/avatar.png'} width={40} height={40} alt='avatar' className="rounded-full"/>
        <div className="flex-1 ml-[-40px] hidden lg:block">
          <NavigationBar className={ !isShow ? 'filter-bg' : '' } />
        </div>
        <div className="lg:hidden ml-auto h-[40px] w-[40px] rounded-full flex justify-center items-center bg-white border border-zinc-200 dark:bg-zinc-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[20px] h-[20px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
          </svg>
        </div>
      </div>
    </div>
  )
}
