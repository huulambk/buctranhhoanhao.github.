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

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GameState {
  level: GameLevel;
  streak: number;
  lives: number; 
  currentQuestionId: string | null; 
  wrongId: string | null; 
  score: number;
  message: string;
  status: 'idle' | 'playing' | 'paused' | 'correct' | 'incorrect' | 'level_complete' | 'game_complete' | 'game_over' | 'practice';
}