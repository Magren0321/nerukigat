'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

// 全局状态来追踪导航开始
let navigationStartCallbacks: Set<() => void> = new Set();

export const startNavigation = () => {
  navigationStartCallbacks.forEach((cb) => cb());
};

export const useProgress = (searchParamsString?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const previousSearchParams = useRef<string | null>(null);
  const currentPathnameRef = useRef(pathname);
  const currentSearchParamsRef = useRef(searchParamsString || '');
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const hasStartedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // 同步 ref 和 state，以及当前 URL
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // 更新当前 URL 的 ref
  useEffect(() => {
    currentPathnameRef.current = pathname;
    currentSearchParamsRef.current = searchParamsString || '';
  }, [pathname, searchParamsString]);

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
  }, []); // 移除依赖，因为使用了 ref

  // 监听路由变化完成（包括 pathname 和 searchParams 的变化）
  useEffect(() => {
    const currentSearchParams = searchParamsString || '';
    
    // 首次挂载时，初始化 previous 值但不触发完成逻辑
    if (previousPathname.current === null) {
      previousPathname.current = pathname;
      previousSearchParams.current = currentSearchParams;
      return;
    }

    // 检测路由或查询参数是否真的变化了
    const pathChanged = previousPathname.current !== pathname;
    const searchParamsChanged = previousSearchParams.current !== currentSearchParams;
    const urlChanged = pathChanged || searchParamsChanged;

    // 如果 URL 没变化但进度条已经启动（比如点击了相同的链接），立即完成进度条
    if (!urlChanged && (isLoading || hasStartedRef.current)) {
      hasStartedRef.current = false;

      // 清除之前的定时器
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];

      // 立即完成进度条
      requestAnimationFrame(() => {
        setProgress(100);
        const timer = setTimeout(() => {
          isLoadingRef.current = false;
          setIsLoading(false);
          setProgress(0);
        }, 150);
        timersRef.current.push(timer);
      });

      return () => {
        timersRef.current.forEach((timer) => clearTimeout(timer));
        timersRef.current = [];
      };
    }

    if (urlChanged && (isLoading || hasStartedRef.current)) {
      previousPathname.current = pathname;
      previousSearchParams.current = currentSearchParams;
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
    } else if (urlChanged && !isLoading && !hasStartedRef.current) {
      // 如果 URL 变化但没有启动进度条（比如浏览器前进/后退），也要更新 previous 值
      previousPathname.current = pathname;
      previousSearchParams.current = currentSearchParams;
    }
  }, [pathname, searchParamsString, isLoading]);

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
            // 比较当前 URL 和目标 URL，如果相同就不启动进度条
            const currentPathname = currentPathnameRef.current;
            const currentSearchParams = currentSearchParamsRef.current;
            
            // 解析目标 URL
            try {
              const url = new URL(href, window.location.origin);
              const targetPathname = url.pathname;
              const targetSearchParams = url.search.substring(1); // 去掉开头的 ?
              
              // 如果 URL 相同（路径和查询参数都相同），就不启动进度条
              if (currentPathname === targetPathname && currentSearchParams === targetSearchParams) {
                return; // 不启动进度条
              }
            } catch {
              // 如果 URL 解析失败，可能是相对路径，尝试直接比较
              // 对于相对路径，假设如果 href 就是当前 pathname + searchParams，则相同
              const currentFullUrl = currentPathname + (currentSearchParams ? `?${currentSearchParams}` : '');
              if (href === currentFullUrl) {
                return; // 不启动进度条
              }
            }
            
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

