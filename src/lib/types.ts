// ユーザーの権限ロール（管理者または投稿者）
export type UserRole = 'admin' | 'author';

// キー設定の型
export interface UserKey {
  key: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// 投稿の種類（VlogまたはBlog）
export type PostType = 'vlog' | 'blog';

// 記事データの型
export interface Post {
  id: string;
  title: string;
  authorKey: string;
  authorName: string;
  type: PostType;
  videoUrl?: string;
  coverImage?: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// キー検証のレスポンス
export interface AuthVerificationResponse {
  valid: boolean;
  name?: string;
  role?: UserRole;
  message?: string;
}
