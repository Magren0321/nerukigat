/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';

export const Neodb = async ({ dbUrl }: {dbUrl : string}) => {

  let dbApiUrl = "https://neodb.social/api/";
  let dbType = "";

  if (/^.*neodb\.social\/.*/.test(dbUrl)) {
    const match = dbUrl.match(/.*neodb\.social\/(.*\/.*)/);
    if (match && match[1]) {
      dbType = match[1];
    } else {
      return <p className="text-center"><small>无法解析的 URL</small></p>;
    }
  } else {
    dbType = dbUrl;
    dbApiUrl = "https://neodb.social/api/catalog/fetch?url=";
  }

  const response = await fetch(`${dbApiUrl}${dbType}`);

  let dbFetch = null;
  let imgUrl = null;

  if (response.ok) {  
    dbFetch = await response.json();
    if (dbFetch.cover_image_url) {
      const imgResponse = await fetch(dbFetch.cover_image_url);
      if (imgResponse.ok) {
        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        imgUrl = `data:image/jpeg;base64,${base64}`;
      } else {
        console.error('Failed to fetch image:', imgResponse.statusText);
      }
    }
    
  } else {
    return <p className="text-center"><small>远程获取内容失败，请检查 API 有效性。</small></p>;
  }

  const itemRating = dbFetch?.rating ? dbFetch?.rating + '⭐️' : '暂无评分';

  return (
    <div className={clsx(
      `flex relative p-4 rounded-lg my-4 w-full mx-auto lg:w-[90%]`,
      `bg-white dark:bg-zinc-700 shadow-[0_3px_10px_#00000053]`,
    )}>
      <img
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        src={`${imgUrl}`}
        alt={dbFetch.title}
        className='h-36 mt-0 mb-0 w-auto rounded'
      />
      <div className="h-36 ml-4 text-sm/7">
        <div className='w-fit'>
          <a href={dbUrl} target="_blank" rel="noreferrer" className='timeline-link no-underline'>「{dbFetch.title}」</a>
        </div>
        <div className="w-fit ml-2">
         {itemRating} 
        </div>
        <div className="overflow-hidden text-ellipsis line-clamp-3">{dbFetch.brief}</div>
      </div>
      <div className={clsx(
        `absolute right-0 top-0 text-center italic px-3  rounded-tr-lg rounded-bl-lg text-sm/7`,
        `text-white bg-blue-500 dark:bg-blue-700`,
      )}>{dbFetch.category}</div>
    </div>
  );
};
