// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/**.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    slug: { type: 'string', required: true },
    tags: { type: 'list', required: true, of: { type: 'string'} },
    description: { type: 'string', required: false },
    publish: { type: 'boolean', required: false, defaultValue: false },
    top: { type: 'boolean', required: false, defaultValue: false },
  },
  computedFields: {
    url: { type: 'string', resolve: (post) => `/posts/${post._raw.flattenedPath}` },
  },
}))

export default makeSource({ contentDirPath: 'posts', documentTypes: [Post] })
