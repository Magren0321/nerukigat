import { allPosts, Post } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';

export const getPostTimeLine = (tag = '') => {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  const dateMap = {} as Record<string, Post[]>;

  // 解析多个 tag（逗号分割）
  const tags = tag
    ? tag
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  posts.forEach((post) => {
    // 如果指定了 tags，文章必须包含所有指定的 tags
    if (tags.length > 0) {
      const hasAllTags = tags.every((t) => post.tags.includes(t));
      if (!hasAllTags) {
        return;
      }
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

/**
 * 计算文章的字数和阅读时间
 * @param bodyCode MDX 编译后的代码字符串
 * @returns { words: number, readingTime: number } 字数和阅读时间（分钟）
 */
export const calculateReadingStats = (bodyCode: string) => {
  // 移除 React/JSX 代码，提取文本内容
  // 移除字符串中的内容（这些是实际的文章内容）
  let text = bodyCode
    // 移除 JSX 标签和属性
    .replace(/<[^>]+>/g, ' ')
    // 移除函数调用和变量名
    .replace(/[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/g, ' ')
    // 移除 import/export 语句
    .replace(/import\s+.*?from\s+['"].*?['"]/g, ' ')
    .replace(/export\s+.*?from\s+['"].*?['"]/g, ' ')
    // 提取字符串字面量中的内容（这些通常是文章内容）
    .replace(/['"`]([^'"`]+)['"`]/g, '$1')
    // 移除代码块标记
    .replace(/```[\s\S]*?```/g, ' ')
    // 移除注释
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*/g, ' ')
    // 移除特殊字符，保留中英文和基本标点
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、；：""''（）【】《》]/g, ' ')
    // 合并空格
    .replace(/\s+/g, ' ')
    .trim();

  // 中文字符按字计算
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  // 英文按单词计算（移除中文后）
  const englishText = text.replace(/[\u4e00-\u9fa5]/g, ' ').trim();
  const englishWords = englishText
    ? englishText.split(/\s+/).filter((word) => word.length > 0).length
    : 0;

  // 总字数：中文字符数 + 英文单词数
  const words = chineseChars + englishWords;

  // 阅读速度：
  // - 中文：300 字/分钟
  // - 英文：200 词/分钟
  // 分别计算后取较大值，更符合实际阅读体验
  const chineseTime = chineseChars > 0 ? Math.ceil(chineseChars / 300) : 0;
  const englishTime = englishWords > 0 ? Math.ceil(englishWords / 200) : 0;
  
  // 阅读时间取两者之和（因为阅读时会同时处理中英文）
  const readingTime = Math.max(1, chineseTime + englishTime);

  return { words, readingTime };
};
