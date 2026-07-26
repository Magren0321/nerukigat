import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const weeklyDirectory = path.join(rootDirectory, 'posts', 'weekly');
const postImageDirectory = path.join(rootDirectory, 'public', 'postImg');

function formatDate(date, separator = '-') {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return [year, month, day].join(separator);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseDate(value) {
  if (!value) {
    return new Date();
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`日期格式不正确：${value}，请使用 YYYY-MM-DD。`);
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`日期不存在：${value}。`);
  }

  return date;
}

function getArgument(name) {
  const argumentIndex = process.argv.indexOf(name);

  if (argumentIndex === -1) {
    return undefined;
  }

  const value = process.argv[argumentIndex + 1];

  if (!value || value.startsWith('--')) {
    throw new Error(`${name} 后需要提供一个值。`);
  }

  return value;
}

function getWeekRange(date) {
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const monday = addDays(date, -daysSinceMonday);
  const sunday = addDays(monday, 6);

  return { monday, sunday };
}

async function getNextWeeklyNumber() {
  await mkdir(weeklyDirectory, { recursive: true });

  const fileNames = await readdir(weeklyDirectory);
  const weeklyNumbers = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map(async (fileName) => {
        const content = await readFile(
          path.join(weeklyDirectory, fileName),
          'utf8'
        );
        const match = content.match(/title:\s*['"]Weekly #(\d+)/);

        return match ? Number(match[1]) : 0;
      })
  );

  return Math.max(0, ...weeklyNumbers) + 1;
}

const targetDate = parseDate(getArgument('--date'));
const { monday, sunday } = getWeekRange(targetDate);
const slug = formatDate(sunday);
const postPath = path.join(weeklyDirectory, `${slug}.mdx`);
const imagePath = path.join(postImageDirectory, slug);
const weeklyNumber = await getNextWeeklyNumber();
const content = `---
title: 'Weekly #${weeklyNumber} '
date: ${formatDate(sunday, '/')}
tags:
  - Weekly
slug: ${slug}
description:
---
# ✍️ 前言

本篇文章是对 **${formatDate(monday)}** 到 **${formatDate(sunday)}** 这一周的记录。
`;

await mkdir(imagePath, { recursive: true });

try {
  await writeFile(postPath, content, { flag: 'wx' });
  console.log(`已创建 Weekly #${weeklyNumber}`);
  console.log(`文章：${path.relative(rootDirectory, postPath)}`);
  console.log(`图片：${path.relative(rootDirectory, imagePath)}/`);
} catch (error) {
  if (error?.code !== 'EEXIST') {
    throw error;
  }

  console.log(
    `本周文章已存在，未覆盖：${path.relative(rootDirectory, postPath)}`
  );
  console.log(`图片目录已就绪：${path.relative(rootDirectory, imagePath)}/`);
}
