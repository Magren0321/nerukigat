import { PostContainer } from '@/components/layout/container/PostContainer';

export default function About() {
  return (
    <PostContainer>
      <article className="prose max-w-full font-sans text-sm/7 text-zinc-900 dark:prose-invert dark:text-zinc-200">
        <h2>👋 About Me</h2>
        <blockquote>
          一片树林分出两条路 ——
          而我选择了人迹更少的一条，从此决定了我一生的道路。
        </blockquote>
        <h2>关于我</h2>
        <span>Hi，我是Magren，见字如晤，很高兴认识你。</span>
        <br></br>
        <span>
          生于千禧，正值弱冠之年，已成为资深社畜，社恐 & INTJ-A，现在在
          <del>北京</del>南京某厂做前端开发，辛苦搬砖中。
        </span>
        <br></br>
        <span>生活简单无趣，尚未脱离低级趣味。</span>
        <br></br>
        <span>在学习并且使用React, Vue, NextJs, TS, Node.js, Sass…</span>
        <br></br>
        <span>
          同时喜欢折腾点别的，偶尔学习Electron, Swift, Android, React Native,
          Go...
        </span>
        <br></br>
        <span>总是在自己折腾没用的 & 不有趣的玩具。</span>
        <h2>兴趣爱好</h2>
        <ul>
          <li>
            偶尔看看书，可以点这里查看{' '}
            <a
              target="_blank"
              href="https://concrete-lightning-e25.notion.site/bad22ab2bf6f4d6c9bf22ee1f911028d?v=7ead59cbdefc48809733e13dbde17e57&pvs=4"
            >
              我的书单
            </a>
          </li>
          <li>
            偶尔打打游戏，<del>任天堂就是世界主宰！</del>{' '}
            基本上任天堂第一方游戏都很喜欢，PC上Steam里面也有玩一些，最近刚买怪猎，如果缺腿部挂件的话可以加个好友
            <ul>
              <li>
                <b>Steam</b>：{' '}
                <a
                  target="_blank"
                  href="https://steamcommunity.com/profiles/76561198811700203/"
                >
                  Magren
                </a>
              </li>
              <li>
                <b>Nintendo FC</b>: SW-1418-2466-9500
              </li>
            </ul>
          </li>
          <li>
            偶尔也看看电影，这里可以看到我都看了什么
            <a
              target="_blank"
              href="https://concrete-lightning-e25.notion.site/9400eef421fc4c428c68d8e69454023c?pvs=4"
            >
              我的影单
            </a>
          </li>
        </ul>
        <h2>现状</h2>
        <ul>
          <li>
            {' '}
            <b>前端开发工程师</b>（2020-至今），技术栈 Vue.js，React，NextJs...
          </li>
          <li>
            {' '}
            <b>准后端开发工程师</b>（2020-至今），技术栈
            NodeJs，Go，Express，MongoDB，PostgreSQL...
          </li>
          <li>
            {' '}
            <b>准准Android开发工程师</b>（2018-2020），技术栈 Java
          </li>
          <li>
            {' '}
            <b>准准准准准UI设计师（N/A）</b>{' '}
          </li>
        </ul>
        <h2>🛸 Find me</h2>
        <ul>
          <li>
            Github:{' '}
            <a target="_blank" href="https://github.com/Magren0321">
              Magren0321
            </a>
          </li>
          <li>
            Twitter:{' '}
            <a target="_blank" href="https://twitter.com/Magren_lin">
              Magren
            </a>
          </li>
          <li>
            Telegram:{' '}
            <a target="_blank" href="https://t.me/Magren_lin">
              Magren
            </a>
          </li>
          <li>
            Bilibili:{' '}
            <a target="_blank" href="https://space.bilibili.com/12031307">
              Magren
            </a>
          </li>
          <li>
            E-mail:{' '}
            <a target="_blank" href="mailto:zhuhenglin21@gmail.com">
              zhuhenglin21@gmail.com
            </a>
          </li>
        </ul>
        <div>
          <h2>Uses</h2>
          <ul>
            <li>
              <b>Laptop</b>
              ：MacBook Pro 14-inch (2021)
            </li>
            <li>
              <b>Phone</b>：iPhone 14 Plus / iPhone 8
            </li>
            <li>
              <b>Keyboard</b>：HHKB Hybird Type-s / Ciy68 / Filco Minila Air
            </li>
            <li>
              <b>Mouse</b>：MX Master 3s for Mac
            </li>
            <li>
              <b>Watch</b>：Apple Watch Series 5
            </li>
            <li>
              <b>Headphone</b>： AirPods2
            </li>
            <li>
              <b>iPad</b>： iPad Air 5
            </li>
            <li>
              <b>Game</b>： Nintendo Switch
            </li>
            <li>
              <b>Browser</b>
              ：Arc / Chrome
            </li>
            <li>
              <b>Terminal</b>：Kitty & zsh
            </li>
            <li>
              <b>Launcher</b>：Raycast
            </li>
            <li>
              <b>Git</b>：Git & SourceTree & GitHub Desktop
            </li>
            <li>
              <b>Editor</b>：VSCode( You can find my vscode setting in{' '}
              <a href="https://github.com/Magren0321/vscode-settings">here</a> )
            </li>
            <li>
              <b>VSCodeTheme</b>： Dracula
            </li>
            <li>
              <b>VSCodeFont</b>： Fira Code
            </li>
            <li>
              <b>Note</b>： Notion
            </li>
            <li>
              <b>Design</b>：Figma
            </li>
          </ul>
        </div>
        <div className="mt-16">
          <blockquote>
            <p>
              The people who are crazy enough to think they can change the world
              are the ones who do.
            </p>
            <footer>— 《 Steve Jobs 》</footer>
          </blockquote>
        </div>
      </article>
    </PostContainer>
  );
}
