import { PostContainer } from '@/components/layout/container/PostContainer';
import { Avatar } from '@/components/ui/avatar/Avatar';
import { SocialList } from '@/components/ui/social/SocialList';
import { TypedText } from '@/components/ui/typed/TypedText';
import clsx from 'clsx';

export default function Home() {
  return (
    <PostContainer className="!mb-0 !mt-0">
      <div className="flex min-h-[calc(100dvh-56px)] items-start py-4 sm:py-6 lg:items-center lg:py-4">
        <section
          className={clsx(
            'grid w-full min-h-[560px] overflow-hidden rounded-2xl ring-1 lg:min-h-[min(640px,calc(100dvh-96px))]',
            'lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_440px]',
            'bg-white/70 ring-zinc-200/80 dark:bg-zinc-900/65 dark:ring-zinc-700/80'
          )}
        >
          <div className="order-2 flex flex-col justify-center px-7 py-8 sm:px-12 sm:py-14 lg:order-none lg:px-16 lg:py-14 xl:px-20">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-zinc-950 sm:text-5xl lg:text-6xl 2xl:text-7xl dark:text-zinc-50">
                Hi, I&#39;m <span className="text-blue-600 dark:text-blue-400">Magren</span>.
              </h1>
              <p className="mt-6 text-xl font-semibold leading-8 text-zinc-800 sm:text-2xl sm:leading-9 dark:text-zinc-200">
                很高兴在这见到你
              </p>
              <TypedText />
            </div>
            <SocialList />
          </div>
          <div className="order-1 flex min-h-[212px] items-center justify-center bg-zinc-200/45 px-6 py-2.5 sm:min-h-[304px] sm:px-8 sm:py-8 dark:bg-zinc-800/65 lg:order-none lg:min-h-full">
            <Avatar />
          </div>
        </section>
      </div>
    </PostContainer>
  );
}
