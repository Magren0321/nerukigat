/* eslint-disable @next/next/no-img-element */
import { NormalContainer } from "@/components/layout/container/NomalContainer"
import Link from "next/link"
import { Comment } from "@/components/ui/comment/Comment"
import friendData from "./config"


const FriendCard = (data : {
  name: string,
  link: string,
  avatar: string,
  desc: string
}) => {
  return (
    <Link className="rounded-lg flex px-3 py-4 bg-zinc-200 dark:bg-zinc-600 mb-3 break-inside-avoid" href={data.link}>
      <img className="rounded-lg h-14 w-14" src={data.avatar} alt={data.name} />
      <div className="ml-3 h-fit flex flex-col justify-between ">
        <div className="font-bold">{data.name}</div>
        <div className="mt-3 break-all text-wrap">
          {data.desc}
        </div>
      </div>
    </Link>
  )
}

const AddFriendRead = () => {
  return (
    <div className="mt-5 prose dark:prose-invert text-textColor mb-12 max-w-full">
      <h1 className="font-bold text-lg mb-5">友链申请</h1>
      <div className="mb-5 text-sm">
        <span>如果你想和我交换友链，可以在下方留言或者<a href="mailto:zhuhenglin21@gmail.com">发送邮件</a>给我，我将会在审核后添加你的博客到友链，留言格式如下：</span>
        <ul className="font-bold">
          <li>name: 博客名字</li>
          <li>link: 博客地址</li>
          <li>desc: 站点的描述</li>
          <li>avatar: 头像/图片的永久链接</li>
        </ul>
        <span className="font-bold">你申请友链无需将我的博客添加至你博客友链，但如果你想添加我的博客至友链可以参考以下信息：</span>
        <ul>
          <li>name: Magren&#39;s Blog</li>
          <li>link: <a href='https://magren.cc'>https://magren.cc</a></li>
          <li>desc: 不为繁华易匠心</li>
          <li>avatar: <a href="/avatar.png">头像地址</a></li>
        </ul>
        <span className="font-bold">出于对彼此的尊重，我希望你的博客至少：</span>
        <ul className="font-bold">
          <li>不存在过多的广告，不包含政治敏感以及违法内容，不过于煽动，符合大多数人的道德标准</li>
          <li>保证大部分内容原创，以及转载注明出处</li>
          <li>Love & Peace</li>
        </ul>
      </div>
    </div>
  )
}

export default function Friends(){
  return (
    <NormalContainer>
      <h1 className="font-bold text-xl mb-10">天下快意之事莫若友,快友之事莫若谈</h1>
      {
        friendData.length === 0 ? (
          <div className="text-center font-bold  border-dashed border-b-2 py-20">
            暂无友链，快来跟我申请吧
          </div>
        ) : (
          <div className="columns-1 lg:columns-2 border-dashed border-b-2 pb-10">
            {friendData.map((item, index) => {
              return (
                <FriendCard key={index} {...item} />
              )
            })}
          </div>
        )
      }
      <footer>
        <AddFriendRead />
        <Comment 
          path={'/friends'}
          serverURL={'https://waline.magren.cc'}/>
      </footer>
    </NormalContainer>
  )
}
