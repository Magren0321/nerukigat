import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { PlaceholderImage } from '@/components/ui/img/PlaceholderImage';
import Link from 'next/link';
import friendData from './config';

const FriendCard = (data: {
  name: string;
  link: string;
  avatar: string;
  desc: string;
}) => {
  return (
    <Link
      className="relative flex h-full break-inside-avoid rounded-xl bg-zinc-200/45 px-4 py-5 transition-colors hover:bg-zinc-200/80 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
      href={data.link}
    >
      <PlaceholderImage
        link={data.avatar}
        alt={data.name}
        className="h-14 w-14"
      />
      <div className="ml-3 flex h-fit flex-col justify-between ">
        <div className="font-bold">{data.name}</div>
        <div className="mt-3 text-wrap break-all">{data.desc}</div>
      </div>
    </Link>
  );
};

const AddFriendRead = () => {
  return (
    <div className="prose mb-12 mt-12 max-w-3xl border-t border-zinc-200/70 pt-10 text-textColor dark:prose-invert dark:border-zinc-800">
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
      <div className="grid gap-10 lg:grid-cols-[minmax(250px,0.7fr)_minmax(0,1.7fr)] lg:gap-14 xl:gap-20">
        <header className="h-fit lg:sticky lg:top-28">
          <p className="mb-3 text-sm font-medium text-blue-600 dark:text-blue-400">
            Friends
          </p>
          <h1 className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-zinc-950 lg:text-4xl dark:text-zinc-50">
            天下快意之事莫若友，快友之事莫若谈
          </h1>
          <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
            {friendData.length} 个朋友的站点
          </p>
        </header>

        <div className="min-w-0">
          {friendData.length === 0 ? (
            <div className="border-b-2 border-dashed py-20 text-center font-bold">
              暂无友链，快来跟我申请吧
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {friendData.map((item) => (
                <FriendCard key={item.link} {...item} />
              ))}
            </div>
          )}
          <footer>
            <AddFriendRead />
            {/* <Comment path={'/friends'} serverURL={'https://waline.magren.cc'} /> */}
          </footer>
        </div>
      </div>
    </NormalContainer>
  );
}
