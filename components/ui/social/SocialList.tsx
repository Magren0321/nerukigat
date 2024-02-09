import Link from "next/link";


const socialLinks: Array<{
	name: string;
	friendlyName: string;
	link: string;
}> = [
	{
		name: "icon-[fa-brands--github-square]", 
		friendlyName: "Github",
		link: "https://github.com/Magren0321",
	},
  {
    name: "icon-[fa6-brands--square-x-twitter]",
    friendlyName: "Twitter",
    link: "https://twitter.com/Magren_lin",
  },
  {
    name : "icon-[ic--baseline-telegram] text-[#4cabf0]",
    friendlyName: "Telegram",
    link: "https://t.me/Magren_lin",
  },
  {
    name: 'icon-[ri--bilibili-fill] text-[#ffa8d2]',
    friendlyName: "Bilibili",
    link: "https://space.bilibili.com/12031307",
  },
  {
		name: "icon-[ic--baseline-email] text-[#f5cc00]",
		friendlyName: "email",
		link: "mailto:zhuhenglin21@gmail.com",
	},
  {
    name: "icon-[mdi--rss] text-[#ffbb00]",
    friendlyName: "RSS",
    link: "/rss.xml",
  },
];

export const SocialList = () => {
  return(
    <div className="flex space-x-4 mt-14">
      {socialLinks.map((social) => {
        return (
          <Link
            key={social.name}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl"
          >
            <span className={social.name}></span>
          </Link>
        );
      })}
    </div>
  )
}
