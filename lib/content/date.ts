const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const shanghaiDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function normalizePublishedDate(value: string): string {
  if (dateOnlyPattern.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid published date: ${value}`);
  }

  const parts = new Map(
    shanghaiDateFormatter
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );

  return `${parts.get('year')}-${parts.get('month')}-${parts.get('day')}`;
}

export function publishedDateToInstant(value: string): Date {
  const normalized = normalizePublishedDate(value);
  return new Date(`${normalized}T00:00:00+08:00`);
}
