
import { PostContainer } from "@/components/layout/container/PostContainer"
import { Avatar } from "@/components/ui/avatar/Avatar"
import { TypedText } from "@/components/ui/typed/TypedText"

export default function Home() {
  return (
    <main>
      <PostContainer>
        <main className="flex justify-between">
          <div>
            <TypedText />
          </div>
          <Avatar />
        </main>
      </PostContainer>
    </main>
  )
}
