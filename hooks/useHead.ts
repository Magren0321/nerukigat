import React from 'react';

type Heading = {
  id: string;
  title: string;
  level: number;
};

export const useHeadings = () => {
  const [headings, setHeadings] = React.useState<Heading[]>([]);

  React.useEffect(() => {
    const seen = new Map<string, number>();

    const elements = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('h1,h2,h3')
    )
      .filter((element) => element.id)
      .map((element) => {
        const rawId = element.id;

        // 处理重复 ID：给 DOM 元素和 heading 数据都加上后缀
        const count = seen.get(rawId) ?? 0;
        seen.set(rawId, count + 1);

        const uniqueId = count === 0 ? rawId : `${rawId}-${count}`;

        // 同步更新 DOM 上的 id，确保后续 getElementById 能找到
        if (count > 0) {
          element.id = uniqueId;
        }

        return {
          id: uniqueId,
          title: element.textContent ?? '',
          level: Number(element.tagName.substring(1)),
        };
      });

    setHeadings(elements);
  }, []);

  return headings;
};
