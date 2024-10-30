export interface Challenge {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    start_date: Date;
    end_date: Date;
    created_by: string; 
    created_at: Date;
    updated_at: Date;
  }