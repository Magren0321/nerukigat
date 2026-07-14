import { defaultSchema } from 'rehype-sanitize';

const anchorAttributes = defaultSchema.attributes?.a ?? [];

/**
 * Starts from rehype-sanitize's GitHub-compatible schema so generated GFM
 * tables, task lists, headings, images, del, and hr remain available. Raw
 * anchors additionally retain target/rel; the renderer hardens blank targets.
 */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...anchorAttributes, 'target', 'rel'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
};
