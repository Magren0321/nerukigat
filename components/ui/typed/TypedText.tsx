import Typed from 'typed.js';
import { useEffect } from 'react'

export default function TypedText(){
  useEffect(() => {
    const poetry = ['']
    const typed = new Typed('.typed', {
      strings: poetry,
      typeSpeed: 60,
      backSpeed: 60,
      startDelay: 600,
      backDelay: 10000,
      shuffle: true,
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
