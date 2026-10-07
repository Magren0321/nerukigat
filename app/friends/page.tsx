import {
  SplitLayout,
  SplitPageContainer,
  SplitSidebar,
} from '@/components/layout/container/SplitPageLayout';
import { SplitPageHeading } from '@/components/layout/container/SplitPageHeading';
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
      className="group grid h-full grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-4 rounded-xl bg-zinc-200/45 p-5 transition-colors hover:bg-zinc-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:translate-y-px motion-reduce:transition-none dark:bg-zinc-800/70 dark:hover:bg-zinc-800 dark:focus-visible:ring-blue-400"
      href={data.link}
    >
      <div className="relative size-14">
        <PlaceholderImage
          link={data.avatar}
          alt={data.name}
          className="size-14 object-cover !left-0 !top-0"
        />
      </div>
      <div className="min-w-0">
        <div className="font-semibold leading-6 text-zinc-900 transition-colors group-hover:text-blue-600 motion-reduce:transition-none dark:text-zinc-100 dark:group-hover:text-blue-400">
          {data.name}
        </div>
        <p className="mt-2 break-words text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {data.desc}
        </p>
      </div>
    </Link>
  );
};

const AddFriendRead = () => {
  return (
    <div className="prose mb-12 mt-12 max-w-3xl border-t border-zinc-200/70 pt-10 text-textColor dark:prose-invert dark:border-zinc-800">
      <h2 className="mb-5 text-lg font-bold">友链申请</h2>
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
    <SplitPageContainer>
      <SplitLayout>
        <SplitSidebar>
          <SplitPageHeading
            label="Friends"
            title="友链"
          />
          <p className="mt-4 max-w-sm text-base leading-7 text-zinc-600 dark:text-zinc-400">
            天下快意之事莫若友，快友之事莫若谈
          </p>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            {friendData.length} 个朋友的站点
          </p>
        </SplitSidebar>

        <div className="min-w-0">
          {friendData.length === 0 ? (
            <div className="border-b-2 border-dashed py-20 text-center font-bold">
              暂无友链，快来跟我申请吧
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </SplitLayout>
    </SplitPageContainer>
  );
}
