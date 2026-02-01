export interface VocabItem {
  word: string;
  ipa: string;
  vn: string;
  hint: string;
}

export type VocabMap = Record<string, VocabItem>;

export enum GameLevel {
  VietnameseToNumber = 1,
  EnglishToNumber = 2,
  IPAToNumber = 3,
}

export interface GameState {
  level: GameLevel;
  streak: number;
  currentQuestionId: string | null; // The key (number) of the current word
  score: number;
  message: string;
  status: 'idle' | 'playing' | 'paused' | 'correct' | 'incorrect' | 'level_complete' | 'game_complete';
}