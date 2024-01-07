// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/index.md`,
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', required: true, of: [] },
    draft: { type: 'boolean', required: false, defaultValue: false },
  },
  computedFields: {
    url: { type: 'string', resolve: (post) => `/posts/${post._raw.flattenedPath}` },
  },
}))

export default makeSource({ contentDirPath: 'posts', documentTypes: [Post] })
