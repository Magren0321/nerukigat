import { PostContainer } from '@/components/layout/container/PostContainer';
import { Comment } from '@/components/ui/comment/Comment';

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
        <span>Hi，我是<b>Magren</b>，网上的朋友更多的叫我<b>虫二</b>，见字如晤，很高兴认识你。</span>
        <br></br>
        <span>我已经忘记了为什么取 Magren 这个 ID，但我已经习惯了它，我的各个平台基本都是这个ID，曾想赋予它独特的意义，然而我连它怎么读都不清楚，遂放弃</span>
        <br></br>
        <span>而虫二则是出自風月无边这个成语</span>
        <br></br>
        <span>如果你是我现实中认识且知道我本名的朋友，请直接叫我名字就好😭</span>
        <br></br><br></br>
        <span>
          是一个只会听粤语但不会讲的广东人
        </span>
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
        <span>总是在自己折腾没用的 & 不有趣的玩具并自娱自乐。</span>
        <br></br><br></br>        
        <span>
          这里持续用于记录我的生活、工作和思考
        </span>
        <h2>喜欢什么</h2>
        <ul>
          <li>
            📖 偶尔看看书，可以点这里查看{' '}
            <a
              target="_blank"
              href="https://concrete-lightning-e25.notion.site/bad22ab2bf6f4d6c9bf22ee1f911028d?v=7ead59cbdefc48809733e13dbde17e57&pvs=4"
            >
              我的书单
            </a>
          </li>
          <li>
            🎮 偶尔打打游戏，端游还有主机游戏玩的比较多，<del>任天堂就是世界主宰！</del>{' '}
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
              <li>
                <b>瓦罗兰特</b>：Magren#72886
              </li>
            </ul>
          </li>
          <li>
            🎬 偶尔也看看电影，这里可以看到我都看了什么
            <a
              target="_blank"
              href="https://concrete-lightning-e25.notion.site/9400eef421fc4c428c68d8e69454023c?pvs=4"
            >
              我的影单
            </a>
          </li>
          <li>
            🎹 偶尔弹琴：constantly struggle with practicing regularly
          </li>
          <li>
            ☕️ 偶尔喝喝咖啡，工作日时候常点美式，家里有一套简单的咖啡工具，周末自己在家用咖啡机做意式
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
            NodeJS，NestJS,Go，Express，MongoDB，PostgreSQL...
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
              <b>Computer</b>
              ：MacBook Pro 14-inch (2021) / Mac mini M4
            </li>
            <li>
              <b>Phone</b>：iPhone 16
            </li>
            <li>
              <b>Keyboard</b>：HHKB Hybird Type-s / Magic Keyboard
            </li>
            <li>
              <b>Mouse</b>：MX Master 3s for Mac
            </li>
            <li>
              <b>Watch</b>：Apple Watch Series 10
            </li>
            <li>
              <b>Headphone</b>： AirPods4 / Sony WH-1000XM4
            </li>
            <li>
              <b>iPad</b>： iPad Air 5
            </li>
            <li>
              <b>Game</b>： Nintendo Switch
            </li>
            <li>
              <b>Browser</b>
              ：Chrome
            </li>
            <li>
              <b>Terminal</b>：iTerm2 & zsh
            </li>
            <li>
              <b>Launcher</b>：Raycast
            </li>
            <li>
              <b>Git</b>：Git & SourceTree & GitHub Desktop
            </li>
            <li>
              <b>Editor</b>：VSCode( You can find my vscode setting in{' '}
              <a href="https://github.com/Magren0321/vscode-settings">here</a> ) & Cursor
            </li>
            <li>
              <b>CodeTheme</b>： Dracula
            </li>
            <li>
              <b>CodeFont</b>：Comic Mono, Fira code, 雅痞-简, monospace
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
      <Comment path={'/about-me'} serverURL={'https://waline.magren.cc'} />
    </PostContainer>
  );
}
