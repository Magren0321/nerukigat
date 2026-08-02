import { PostContainer } from '@/components/layout/container/PostContainer';
import { Avatar } from '@/components/ui/avatar/Avatar';
import { SocialList } from '@/components/ui/social/SocialList';
import { TypedText } from '@/components/ui/typed/TypedText';
import clsx from 'clsx';

export default function Home() {
  return (
    <PostContainer>
      <section
        className={clsx(
          'flex min-h-[560px] flex-col items-center justify-between gap-16 overflow-hidden rounded-2xl border px-6 py-14 transition duration-300 sm:px-10 lg:flex-row lg:px-20 xl:px-28',
          'border-zinc-200/80 bg-white dark:border-zinc-700 dark:bg-zinc-800/70',
          'hover:-translate-y-1 hover:shadow-[0_24px_70px_-36px_rgba(0,0,0,0.35)] motion-reduce:transform-none motion-reduce:transition-none dark:hover:shadow-[0_24px_70px_-36px_rgba(0,0,0,0.75)]'
        )}
      >
        <div className="w-full max-w-xl text-xl font-bold lg:text-3xl">
          <div className="mb-5 pl-1">Hi👋🏻, I&#39;m Magren 🦊</div>
          <div className="mb-5 pl-1">很高兴在这见到你</div>
          <TypedText />
          <SocialList />
        </div>
        <Avatar />
      </section>
    </PostContainer>
  );
}
