export const PostItem = ({
  active,
  level,
  text,
  id,
}: {
  active: boolean;
  level: number;
  text: string;
  id: string;
}) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const scrollPosition = element.offsetTop;
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  };
  return (
    <a
      onClick={() => scrollTo(id)}
      className="group/item flex cursor-pointer items-center gap-2 py-1 transition-colors"
      style={{ paddingLeft: `${level}rem` }}
    >
      {/* 左侧方块（dash） */}
      <span
        className={`h-1 w-4 flex-shrink-0 rounded transition-colors ${
          active
            ? 'bg-black dark:bg-white'
            : 'bg-gray-400 dark:bg-gray-500'
        }`}
      />
      {/* 文字内容 */}
      <span
        className={`overflow-hidden text-ellipsis whitespace-nowrap font-sans font-medium transition-opacity ${
          active
            ? 'opacity-100 text-black dark:text-white'
            : 'opacity-0 text-gray-400 dark:text-gray-400 group-hover:opacity-100'
        }`}
      >
        {text}
      </span>
    </a>
  );
};
