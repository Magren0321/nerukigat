'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

const introduction = [
  '我是一个软件开发工程师',
  '也是一个游戏玩家',
  '总是在瞎折腾',
  '背着相机到处乱跑',
  '喜欢做些没用也不有趣的东西',
  '想成为一个有趣的人',
];

export function TypedText() {
  const textRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || !textRef.current) return;

    const typed = new Typed(textRef.current, {
      strings: [introduction.join('^180<br />')],
      typeSpeed: 30,
      startDelay: 320,
      loop: false,
      showCursor: true,
      cursorChar: '|',
    });

    return () => typed.destroy();
  }, [shouldReduceMotion]);

  return (
    <div className="mt-5 min-h-[10.5rem] text-lg font-medium leading-7 tracking-[0.01em] text-zinc-700 sm:min-h-[12rem] sm:text-xl sm:leading-8 xl:text-[22px] dark:text-zinc-300">
      <span className="sr-only">{introduction.join('。')}</span>
      <span aria-hidden="true">
        {shouldReduceMotion ? (
          introduction.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))
        ) : (
          <span ref={textRef} />
        )}
      </span>
    </div>
  );
}
