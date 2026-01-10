'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

// 全局状态来追踪导航开始
let navigationStartCallbacks: Set<() => void> = new Set();

export const startNavigation = () => {
  navigationStartCallbacks.forEach((cb) => cb());
};

export const useProgress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const hasStartedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // 同步 ref 和 state
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // 注册全局导航开始监听
  useEffect(() => {
    const handleNavigationStart = () => {
      if (!isLoadingRef.current) {
        hasStartedRef.current = true;
        isLoadingRef.current = true;
        setIsLoading(true);
        setProgress(10);

        // 清除之前的定时器
        timersRef.current.forEach((timer) => clearTimeout(timer));
        timersRef.current = [];

        // 模拟进度增长
        const timer1 = setTimeout(() => setProgress(30), 50);
        const timer2 = setTimeout(() => setProgress(50), 100);
        const timer3 = setTimeout(() => setProgress(70), 150);
        const timer4 = setTimeout(() => setProgress(85), 200);

        timersRef.current.push(timer1, timer2, timer3, timer4);
      }
    };

    navigationStartCallbacks.add(handleNavigationStart);
    return () => {
      navigationStartCallbacks.delete(handleNavigationStart);
    };
  }, []);

  // 监听路由变化完成
  useEffect(() => {
    // 检测路由是否真的变化了
    const pathChanged = previousPathname.current !== pathname;

    if (pathChanged && (isLoading || hasStartedRef.current)) {
      previousPathname.current = pathname;
      hasStartedRef.current = false;

      // 清除之前的定时器
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];

      // 路由完成后，完成进度条
      const timer5 = setTimeout(() => {
        requestAnimationFrame(() => {
          setProgress(100);
          const timer6 = setTimeout(() => {
            isLoadingRef.current = false;
            setIsLoading(false);
            setProgress(0);
          }, 150);
          timersRef.current.push(timer6);
        });
      }, 200);

      timersRef.current.push(timer5);

      return () => {
        timersRef.current.forEach((timer) => clearTimeout(timer));
        timersRef.current = [];
      };
    }
  }, [pathname, isLoading]);

  // 监听所有 Link 点击事件
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link) {
        const href = link.getAttribute('href');
        // 检查是否是内部链接
        if (href && (href.startsWith('/') || href.startsWith('#'))) {
          // 排除锚点链接
          if (!href.startsWith('#')) {
            startNavigation();
          }
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  return { isLoading, progress };
};

