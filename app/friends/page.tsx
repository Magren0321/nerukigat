/* eslint-disable @next/next/no-img-element */
import { NormalContainer } from '@/components/layout/container/NomalContainer';
import Link from 'next/link';
import { PlaceholderImage } from '@/components/ui/img/PlaceholderImage';
import friendData from './config';

const FriendCard = (data: {
  name: string;
  link: string;
  avatar: string;
  desc: string;
}) => {
  return (
    <Link
      className="relative mb-3 flex break-inside-avoid rounded-lg bg-zinc-200/45  px-3 py-4 dark:bg-zinc-600"
      href={data.link}
    >
      <PlaceholderImage link={data.avatar} alt={data.name} className="h-14 w-14" />
      <div className="ml-3 flex h-fit flex-col justify-between ">
        <div className="font-bold">{data.name}</div>
        <div className="mt-3 text-wrap break-all">{data.desc}</div>
      </div>
    </Link>
  );
};

const AddFriendRead = () => {
  return (
    <div className="prose mb-12 mt-5 max-w-full text-textColor dark:prose-invert">
      <h1 className="mb-5 text-lg font-bold">友链申请</h1>
      <div className="mb-5 text-sm">
        <span>
          如果你想和我交换友链，可以
          <a href="mailto:zhuhenglin21@gmail.com">发送邮件</a>
          给我，我将会在审核后添加你的博客到友链，格式如下：
        </span>
        <ul className="font-bold">
          <li>name: 博客名字</li>
          <li>link: 博客地址</li>
          <li>desc: 站点的描述</li>
          <li>avatar: 头像/图片的永久链接</li>
        </ul>
        <span className="font-bold">
          你申请友链无需将我的博客添加至你博客友链，但如果你想添加我的博客至友链可以参考以下信息：
        </span>
        <ul>
          <li>name: Magren&#39;s Blog</li>
          <li>
            link: <a href="https://magren.cc">https://magren.cc</a>
          </li>
          <li>desc: 不为繁华易匠心</li>
          <li>
            avatar: <a href="/avatar.png">头像地址</a>
          </li>
        </ul>
        <span className="font-bold">
          出于对彼此的尊重，我希望你的博客至少：
        </span>
        <ul className="font-bold">
          <li>
            不存在过多的广告，不包含政治敏感以及违法内容，不过于煽动，符合大多数人的道德标准
          </li>
          <li>保证大部分内容原创，以及转载注明出处</li>
          <li>Love & Peace</li>
        </ul>
      </div>
    </div>
  );
};

export default function Friends() {
  return (
    <NormalContainer>
      <h1 className="mb-10 text-xl font-bold">
        天下快意之事莫若友,快友之事莫若谈
      </h1>
      {friendData.length === 0 ? (
        <div className="border-b-2 border-dashed  py-20 text-center font-bold">
          暂无友链，快来跟我申请吧
        </div>
      ) : (
        <div className="columns-1 border-b-2 border-dashed pb-10 lg:columns-2">
          {friendData.map((item, index) => {
            return <FriendCard key={index} {...item} />;
          })}
        </div>
      )}
      <footer>
        <AddFriendRead />
        {/* <Comment path={'/friends'} serverURL={'https://waline.magren.cc'} /> */}
      </footer>
    </NormalContainer>
  );
}
