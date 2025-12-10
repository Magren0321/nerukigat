import { allPosts, Post } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';

export const getPostTimeLine = (tag = '') => {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  const dateMap = {} as Record<string, Post[]>;

  posts.forEach((post) => {
    if (tag && !post.tags.includes(tag)) {
      return;
    }
    const year = format(parseISO(post.date), 'yyyy');
    if (!dateMap[year]) {
      dateMap[year] = [];
    }
    dateMap[year].push(post);
  });

  return {
    length: Object.values(dateMap).reduce((acc, arr) => acc + arr.length, 0),
    value: dateMap,
  };
};
