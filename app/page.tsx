import { PostContainer } from '@/components/layout/container/PostContainer';
import { Avatar } from '@/components/ui/avatar/Avatar';
import { SocialList } from '@/components/ui/social/SocialList';
import { TypedText } from '@/components/ui/typed/TypedText';
import clsx from 'clsx';

export default function Home() {
  return (
    <main>
      <PostContainer>
        <main className={clsx(
          'flex flex-col items-center justify-between rounded-lg lg:flex-row px-[10px] py-[30px]  lg:p-[110px]  transition-all duration-300  ',
          'bg-white dark:bg-zinc-700 border-solid border-[1px]',
          'hover:shadow-[0_0_200px_1px_rgb(37,99,235,0.3)]  hover:border-[rgb(37,99,235,0.7)] hover:scale-[1.01] hover:rotate-[1deg] ',
        )}>
          <div className="mb-32 w-full max-w-xl text-xl font-bold lg:mb-0 lg:mt-0 lg:text-3xl ">
            <div className="mb-5 pl-1">Hi👋🏻, I&#39;m Magren 🦊</div>
            <div className="mb-5 pl-1">很高兴在这见到你</div>
            <TypedText />
            <SocialList />
          </div>
          <Avatar />
        </main>
      </PostContainer>
    </main>
  );
}
