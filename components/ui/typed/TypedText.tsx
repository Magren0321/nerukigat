'use client';

import { useEffect } from 'react';
import Typed from 'typed.js';

export function TypedText() {
  useEffect(() => {
    const poetry = [
      '我是一个软件开发工程师',
      '也是一个游戏玩家',
      '总是在瞎折腾',
      '背着相机到处乱跑',
      '喜欢做些没用也不有趣的东西',
      '想成为一个有趣的人'
    ];
    const typed = new Typed('.typed', {
      strings: poetry,
      typeSpeed: 40,
      backSpeed: 60,
      startDelay: 600,
      backDelay: 1400,
      loop: true,
      smartBackspace: true,
      showCursor: true,
      cursorChar: '|',
    });
    return () => typed.destroy();
  }, []);

  return (
    <div className="flex-shrink-0 pl-1">
      <span className="typed leading-7 tracking-wide"></span>
    </div>
  );
}
