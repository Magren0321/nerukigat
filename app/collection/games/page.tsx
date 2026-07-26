import { GameCollectionPage } from '@/components/collection/GameCollectionPage';
import { gameRecords } from '@/data/collections/games';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "游戏记录 | Magren's Blog",
  description: '记录玩过、正在玩和还没开始的游戏。',
};

export default function GamesPage() {
  return <GameCollectionPage records={gameRecords} />;
}
