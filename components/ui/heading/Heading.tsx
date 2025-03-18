'use client';

import { useId, type DetailedHTMLProps, type HTMLAttributes } from 'react';

export const Heading1 = (
  props: DetailedHTMLProps<
    HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) => {
  return <Heading level={1}>{props.children}</Heading>;
};

export const Heading2 = (
  props: DetailedHTMLProps<
    HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) => {
  return <Heading level={2}>{props.children}</Heading>;
};

export const Heading3 = (
  props: DetailedHTMLProps<
    HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) => {
  return <Heading level={3}>{props.children}</Heading>;
};

export const Heading = ({
  children,
  level = 1,
}: {
  children: React.ReactNode;
  level?: number;
}) => {
  // Use React's useId for generating a stable, unique ID prefix
  const uniqueId = useId();
  
  const getStaticId = (text: string) => {
    if (!text) return '';
    // Create a slug from the text
    return text.toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')   
      .replace(/\-\-+/g, '-');  
  };

  const getId = (text: string) => {
    const baseId = getStaticId(text);
    return baseId || uniqueId;
  };

  {
    switch (level) {
      case 1:
        return (
          <h1
            className="text-2xl font-bold"
            id={getId(children?.toString() || '')}
          >
            {children}
          </h1>
        );
      case 2:
        return (
          <h2
            className="text-xl font-bold"
            id={getId(children?.toString() || '')}
          >
            {children}
          </h2>
        );
      case 3:
        return (
          <h3
            className="text-lg font-bold"
            id={getId(children?.toString() || '')}
          >
            {children}
          </h3>
        );
      default:
        return (
          <h1
            className="text-2xl font-bold"
            id={getId(children?.toString() || '')}
          >
            {children}
          </h1>
        );
    }
  }
};
