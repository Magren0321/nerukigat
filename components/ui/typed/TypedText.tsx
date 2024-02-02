'use client'

import Typed from 'typed.js';
import { useEffect } from 'react'

export function TypedText(){
  useEffect(() => {
    const poetry = [
      '一个前端开发工程师',
      '总是在做没用也不好玩的东西',
    ]
    const typed = new Typed('.typed', {
      strings: poetry,
      typeSpeed: 40,
      backSpeed: 60,
      startDelay: 600,
      loop: true,
    })
    return () => typed.destroy()
  }, [])

  return (
    <div className="flex-shrink-0 pl-1">
      <span className="typed leading-7 tracking-wide"></span>
    </div>
  )
}
