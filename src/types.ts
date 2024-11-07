export interface Challenge {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    created_by: string;
    created_at: Date;
    updated_at: Date;
    duration: number;
  }

  export interface Post {
    id: number;
    user_id: string;
    media_id?: number;
    created_at: string;
    featured: boolean;
    body: string;
    media_file_path?: string;
  }