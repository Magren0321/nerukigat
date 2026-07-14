import { PostEditor } from '@/components/admin/posts/PostEditor';

export default function NewAdminPostPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">新建内容</p>
        <h1 className="mt-1 text-2xl font-bold">写一篇新文章</h1>
      </div>
      <PostEditor />
    </div>
  );
}
