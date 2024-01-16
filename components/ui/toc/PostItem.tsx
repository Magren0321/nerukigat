export const PostItem = ({
  active,
  level,
  text,
  id
} : {
  active: boolean,
  level: number,
  text: string,
  id: string
}) =>{
  return (
    <>
      <a
        className={`${
          active ? 'text-black dark:text-white' : 'text-gray-400 dark:text-black-200'
        } block overflow-hidden text-ellipsis text-nowrap py-1 cursor-pointer font-sans font-medium hover:text-black dark:hover:text-white`}
        style={{ paddingLeft: `${level}rem` }}
        href={`#${id}`}
      >
        {text}
      </a>
    </>
  )
}
