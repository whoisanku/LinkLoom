export type TMode = 'target' | 'introducer';

export type TIntroducer = {
  id: string;
  username: string;
  score: number;
  connections: string[];
}

export type TTarget = {
  id: string;
  username: string;
  score: number;
  relevance: string;
}
