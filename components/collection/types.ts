export type CollectionKind = 'games' | 'films' | 'books';
export type CollectionStatus =
  | 'done'
  | 'active'
  | 'casual'
  | 'paused'
  | 'retired'
  | 'planned';
export type CollectionRating = 1 | 2 | 3 | 4 | 5;

export interface CollectionRecord {
  title: string;
  time?: string;
  rating?: CollectionRating;
  status?: CollectionStatus;
  category?: string;
  meta?: string;
  note?: string;
}
