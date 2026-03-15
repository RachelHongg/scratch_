export type ConfirmStatus = 'idle' | 'pending' | 'confirmed' | 'failed';
export interface ConfirmState { [coinId: string]: ConfirmStatus }
export type ConfirmAction =
  | { type: 'START'; coinId: string }
  | { type: 'SUCCESS'; coinId: string }
  | { type: 'FAIL'; coinId: string }
  | { type: 'RESET'; coinId: string }
  | { type: 'RESET_ALL' };
