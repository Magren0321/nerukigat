import { PostList } from '@/components/posts/PostList';
import { listPublicPostSummaries } from '@/lib/content';

export default async function Posts() {
  const posts = (await listPublicPostSummaries()).filter(
    (post) => post.kind === 'post'
  );

  return <PostList posts={posts} />;
}
