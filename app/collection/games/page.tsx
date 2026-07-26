import { GameCollectionPage } from '@/components/collection/GameCollectionPage';
import { gameRecords } from '@/data/collections/games';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Game | Magren's Blog",
  description: '即使引导早已破碎，也请您当上艾尔登之王。 ——《艾尔登法环》',
};

export default function GamesPage() {
  return <GameCollectionPage records={gameRecords} />;
}
