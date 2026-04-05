export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string;
  content: string;
  excerpt?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
}
