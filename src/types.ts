export interface Challenge {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    created_by: string;
    created_at: Date;
    updated_at: Date;
    duration: number;
  }