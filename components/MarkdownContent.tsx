import { Heading1, Heading2, Heading3 } from '@/components/ui/heading/Heading';
import { Image } from '@/components/ui/img/Image';
import { ensureSafeBlankTargetRel, markdownSanitizeSchema } from '@/lib/markdown';
import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const MarkdownHeading1: NonNullable<Components['h1']> = ({ node: _node, children }) => (
  <Heading1>{children}</Heading1>
);

const MarkdownHeading2: NonNullable<Components['h2']> = ({ node: _node, children }) => (
  <Heading2>{children}</Heading2>
);

const MarkdownHeading3: NonNullable<Components['h3']> = ({ node: _node, children }) => (
  <Heading3>{children}</Heading3>
);

const MarkdownImage: NonNullable<Components['img']> = ({ node: _node, ...props }) => (
  <Image {...props} alt={props.alt ?? ''} />
);

const MarkdownLink: NonNullable<Components['a']> = ({
  node: _node,
  target,
  rel,
  ...props
}) => (
  <a
    {...props}
    target={target}
    rel={ensureSafeBlankTargetRel(target, rel)}
  />
);

const markdownComponents: Components = {
  h1: MarkdownHeading1,
  h2: MarkdownHeading2,
  h3: MarkdownHeading3,
  img: MarkdownImage,
  a: MarkdownLink,
};

export interface MarkdownContentProps {
  markdown: string;
}

/**
 * Server Component by default: Markdown is parsed and sanitized before the
 * existing client-side heading/image islands receive their rendered props.
 */
export const MarkdownContent = ({ markdown }: MarkdownContentProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]]}
    components={markdownComponents}
    urlTransform={defaultUrlTransform}
  >
    {markdown}
  </ReactMarkdown>
);
