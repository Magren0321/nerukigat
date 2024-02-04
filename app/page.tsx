
import { PostContainer } from "@/components/layout/container/PostContainer"
import { Avatar } from "@/components/ui/avatar/Avatar"
import { TypedText } from "@/components/ui/typed/TypedText"
import { SocialList } from "@/components/ui/social/SocialList"

export default function Home() {
  return (
    <main>
      <PostContainer>
        <main className="flex justify-between items-center lg:pt-[110px] pt-[40px] flex-col lg:flex-row">
          <div className="text-xl font-bold mb-48 lg:mt-0 lg:mb-0 w-full max-w-xl lg:text-3xl">
            <div className="mb-5 pl-1">Hi👋🏻, I&#39;m Magren 🦊</div>
            <div className="mb-5 pl-1">很高兴在这见到你</div>
            <TypedText />
            <SocialList />
          </div>
          <Avatar />
        </main>
      </PostContainer>
    </main>
  )
}
