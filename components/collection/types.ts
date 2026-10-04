export type CollectionKind = 'games' | 'films' | 'books';
export type CollectionStatus =
  | 'done'
  | 'active'
  | 'casual'
  | 'paused'
  | 'retired'
  | 'planned';

export interface CollectionRecord {
  title: string;
  time?: string;
  status?: CollectionStatus;
  category?: string;
  meta?: string;
  note?: string;
}
