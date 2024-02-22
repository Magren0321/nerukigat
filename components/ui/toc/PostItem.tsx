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
    <>
      <a
        onClick={() => scrollTo(id)}
        className={`${
          active
            ? 'text-black dark:text-white'
            : 'dark:text-black-200 text-gray-400'
        } block cursor-pointer overflow-hidden text-ellipsis text-nowrap py-1 font-sans font-medium hover:text-black dark:hover:text-white`}
        style={{ paddingLeft: `${level}rem` }}
      >
        {text}
      </a>
    </>
  );
};
