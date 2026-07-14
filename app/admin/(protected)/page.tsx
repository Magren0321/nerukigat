import Link from 'next/link';

const sections = [
  {
    href: '/admin/posts',
    title: '文章管理',
    description: '创建、编辑、预览和发布 Markdown 文章。',
  },
  {
    href: '/admin/media',
    title: '媒体库',
    description: '上传到 R2、补充图片信息并插入文章。',
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">管理后台</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        公开博客样式保持不变；这里负责内容和图片的写入流程。
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <Link
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            href={section.href}
            key={section.href}
          >
            <h2 className="font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
