import Link from 'next/link';

const socialLinks: Array<{
  icon: string;
  friendlyName: string;
  link: string;
}> = [
  {
    icon: 'icon-[tabler--brand-github]',
    friendlyName: 'GitHub',
    link: 'https://github.com/Magren0321',
  },
  {
    icon: 'icon-[tabler--brand-x]',
    friendlyName: 'X',
    link: 'https://twitter.com/Magren_lin',
  },
  {
    icon: 'icon-[tabler--brand-telegram]',
    friendlyName: 'Telegram',
    link: 'https://t.me/Magren_lin',
  },
  {
    icon: 'icon-[tabler--brand-bilibili]',
    friendlyName: 'Bilibili',
    link: 'https://space.bilibili.com/12031307',
  },
  {
    icon: 'icon-[tabler--camera]',
    friendlyName: 'Gallery',
    link: 'https://magren.afilmory.art/',
  },
  {
    icon: 'icon-[tabler--mail]',
    friendlyName: 'Email',
    link: 'mailto:zhuhenglin21@gmail.com',
  },
  {
    icon: 'icon-[tabler--rss]',
    friendlyName: 'RSS',
    link: '/rss.xml',
  },
];

export const SocialList = () => {
  return (
    <nav className="mt-10" aria-label="Social links">
      <ul className="grid w-fit grid-cols-4 gap-2 min-[440px]:grid-cols-7">
        {socialLinks.map((social) => {
          const opensInNewTab = social.link.startsWith('https://');

          return (
            <li key={social.friendlyName}>
              <Link
                href={social.link}
                target={opensInNewTab ? '_blank' : undefined}
                rel={opensInNewTab ? 'noopener noreferrer' : undefined}
                aria-label={social.friendlyName}
                title={social.friendlyName}
                className="inline-flex size-11 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 transition-[transform,border-color,background-color,color] duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97] motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-zinc-900"
              >
                <span aria-hidden="true" className={`${social.icon} size-5`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
