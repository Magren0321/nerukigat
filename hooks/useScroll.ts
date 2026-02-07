import { useCallback, useEffect, useState } from 'react';

/**
 * 监听滚动事件，返回当前视口中最接近顶部的标题 ID
 * 使用 scroll 事件而非 IntersectionObserver，避免多标题同时触发的问题
 */
export const useScroll = (ids: string[]) => {
  const [activeId, setActiveId] = useState<string>();

  const handleScroll = useCallback(() => {
    if (ids.length === 0) return;

    // 在回调中动态获取视口高度，避免 SSR 问题
    const topOffset = window.innerHeight * 0.3;

    // 获取所有标题元素及其位置
    const headingPositions = ids
      .map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return { id, top: el.getBoundingClientRect().top };
      })
      .filter(Boolean) as { id: string; top: number }[];

    if (headingPositions.length === 0) return;

    // 找到已经滚过顶部偏移量的最后一个标题（即当前所在的 section）
    const passed = headingPositions.filter((h) => h.top <= topOffset);

    if (passed.length > 0) {
      // 取最后一个滚过去的（离视口顶部最近的）
      setActiveId(passed[passed.length - 1].id);
    } else {
      // 都还没滚到，高亮第一个
      setActiveId(headingPositions[0].id);
    }
  }, [ids]);

  useEffect(() => {
    if (ids.length === 0) return;

    // 初始化时执行一次
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ids, handleScroll]);

  return activeId;
};
