import fs from 'fs/promises';
import path from 'path';
import { UserKey, Post } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const KEYS_FILE = path.join(DATA_DIR, 'keys.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

// ディレクトリとファイルの初期化保証
async function ensureFilesExist() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}

  try {
    await fs.access(KEYS_FILE);
  } catch {
    const defaultKeys = {
      keys: [
        {
          key: 'admin-master-key-777',
          name: '管理者',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    await fs.writeFile(KEYS_FILE, JSON.stringify(defaultKeys, null, 2), 'utf-8');
  }

  try {
    await fs.access(POSTS_FILE);
  } catch {
    const defaultPosts = { posts: [] };
    await fs.writeFile(POSTS_FILE, JSON.stringify(defaultPosts, null, 2), 'utf-8');
  }
}

// --- キー操作 ---

export async function getKeys(): Promise<UserKey[]> {
  await ensureFilesExist();
  try {
    const data = await fs.readFile(KEYS_FILE, 'utf-8');
    const json = JSON.parse(data);
    return json.keys || [];
  } catch (err) {
    console.error('Error reading keys.json:', err);
    return [];
  }
}

export async function saveKeys(keys: UserKey[]): Promise<void> {
  await ensureFilesExist();
  await fs.writeFile(KEYS_FILE, JSON.stringify({ keys }, null, 2), 'utf-8');
}

export async function findKey(keyStr: string): Promise<UserKey | null> {
  if (!keyStr) return null;
  const keys = await getKeys();
  const trimmed = keyStr.trim();
  const matched = keys.find((k) => k.key === trimmed);
  return matched || null;
}

export async function addKey(newKey: UserKey): Promise<{ success: boolean; message?: string }> {
  const keys = await getKeys();
  if (keys.some((k) => k.key === newKey.key.trim())) {
    return { success: false, message: 'このキーは既に登録されています' };
  }
  keys.unshift(newKey);
  await saveKeys(keys);
  return { success: true };
}

export async function deleteKey(keyStr: string): Promise<boolean> {
  const keys = await getKeys();
  const filtered = keys.filter((k) => k.key !== keyStr.trim());
  if (filtered.length === keys.length) return false;
  await saveKeys(filtered);
  return true;
}

// --- 記事操作 ---

export async function getPosts(): Promise<Post[]> {
  await ensureFilesExist();
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const json = JSON.parse(data);
    const posts: Post[] = json.posts || [];
    // 新しい順にソート
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error reading posts.json:', err);
    return [];
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.id === id) || null;
}

export async function savePost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Post> {
  const posts = await getPosts();
  const now = new Date().toISOString();

  if (postData.id) {
    // 既存記事の更新
    const index = posts.findIndex((p) => p.id === postData.id);
    if (index !== -1) {
      const existing = posts[index];
      const updatedPost: Post = {
        ...existing,
        ...postData,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: now,
      };
      posts[index] = updatedPost;
      await fs.writeFile(POSTS_FILE, JSON.stringify({ posts }, null, 2), 'utf-8');
      return updatedPost;
    }
  }

  // 新規記事作成
  const newPost: Post = {
    ...postData,
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(newPost);
  await fs.writeFile(POSTS_FILE, JSON.stringify({ posts }, null, 2), 'utf-8');
  return newPost;
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  await fs.writeFile(POSTS_FILE, JSON.stringify({ posts: filtered }, null, 2), 'utf-8');
  return true;
}
