export function calculateMarkdownReadingStats(markdown: string) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、；：""''（）【】《》]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const chineseCharacters = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishText = text.replace(/[\u4e00-\u9fa5]/g, ' ').trim();
  const englishWords = englishText
    ? englishText.split(/\s+/).filter(Boolean).length
    : 0;
  const wordCount = chineseCharacters + englishWords;
  const readingMinutes = Math.max(
    1,
    Math.ceil(chineseCharacters / 300) + Math.ceil(englishWords / 200)
  );

  return { wordCount, readingMinutes };
}
