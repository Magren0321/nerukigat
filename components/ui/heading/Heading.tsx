'use client';

import { type DetailedHTMLProps, type HTMLAttributes } from 'react';

/**
 * 将标题文本转为合法的 HTML ID（支持中文/Unicode）
 * 纯函数，无副作用，确保 SSR 和客户端输出一致
 */
const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0080-\uffff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

type HeadingProps = DetailedHTMLProps<
  HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>;

export const Heading1 = (props: HeadingProps) => {
  return <Heading level={1}>{props.children}</Heading>;
};

export const Heading2 = (props: HeadingProps) => {
  return <Heading level={2}>{props.children}</Heading>;
};

export const Heading3 = (props: HeadingProps) => {
  return <Heading level={3}>{props.children}</Heading>;
};

const levelClassMap: Record<number, string> = {
  1: 'text-2xl font-bold',
  2: 'text-xl font-bold mt-0',
  3: 'text-lg font-bold',
};

export const Heading = ({
  children,
  level = 1,
}: {
  children: React.ReactNode;
  level?: number;
}) => {
  const Tag = `h${Math.min(Math.max(level, 1), 3)}` as 'h1' | 'h2' | 'h3';
  const id = slugify(children?.toString() || '');
  const className = levelClassMap[level] ?? levelClassMap[1];

  return (
    <Tag className={className} id={id}>
      {children}
    </Tag>
  );
};
