import { PostContainer } from '@/components/layout/container/PostContainer';
import { Avatar } from '@/components/ui/avatar/Avatar';
import { SocialList } from '@/components/ui/social/SocialList';
import { TypedText } from '@/components/ui/typed/TypedText';

export default function Home() {
  return (
    <main>
      <PostContainer>
        <main className="flex flex-col items-center justify-between rounded-lg bg-white px-[10px] py-[30px] lg:flex-row lg:p-[110px] dark:bg-zinc-700">
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
