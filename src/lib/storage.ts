import fs from 'fs/promises';
import path from 'path';
import { UserKey, Post } from './types';

// データディレクトリの解決（カレントディレクトリの data、または __dirname から探索）
function resolveDataDir(): string {
  return path.join(process.cwd(), 'data');
}

// キー設定ファイル（keys.json または key.json の両方を自動検知）
async function getKeysFilePath(): Promise<string> {
  const dir = resolveDataDir();
  const keysPath = path.join(dir, 'keys.json');
  const keyPath = path.join(dir, 'key.json');

  try {
    await fs.access(keysPath);
    return keysPath;
  } catch {
    try {
      await fs.access(keyPath);
      return keyPath;
    } catch {
      return keysPath;
    }
  }
}

// 記事データファイル
function getPostsFilePath(): string {
  return path.join(resolveDataDir(), 'posts.json');
}

// ディレクトリと初期ファイルの保証
async function ensureFilesExist() {
  const dataDir = resolveDataDir();
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}

  const keysFile = await getKeysFilePath();
  try {
    await fs.access(keysFile);
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
    await fs.writeFile(keysFile, JSON.stringify(defaultKeys, null, 2), 'utf-8');
  }

  const postsFile = getPostsFilePath();
  try {
    await fs.access(postsFile);
  } catch {
    const defaultPosts = { posts: [] };
    await fs.writeFile(postsFile, JSON.stringify(defaultPosts, null, 2), 'utf-8');
  }
}

// --- キー操作 ---

export async function getKeys(): Promise<UserKey[]> {
  await ensureFilesExist();
  const keysFile = await getKeysFilePath();
  try {
    const data = await fs.readFile(keysFile, 'utf-8');
    const json = JSON.parse(data);

    // { keys: [...] } 形式と、直接配列 [...] 形式の両方に対応
    if (Array.isArray(json)) {
      return json;
    }
    if (json && Array.isArray(json.keys)) {
      return json.keys;
    }
    return [];
  } catch (err) {
    console.error('Error reading keys file:', err);
    return [];
  }
}

export async function saveKeys(keys: UserKey[]): Promise<void> {
  await ensureFilesExist();
  const keysFile = await getKeysFilePath();
  await fs.writeFile(keysFile, JSON.stringify({ keys }, null, 2), 'utf-8');
}

export async function findKey(keyStr: string): Promise<UserKey | null> {
  if (!keyStr) return null;
  const keys = await getKeys();
  const trimmed = keyStr.trim();

  // キーの完全一致判定（大文字小文字や前後空白を柔軟に許容）
  const matched = keys.find(
    (k) => k && k.key && k.key.trim().toLowerCase() === trimmed.toLowerCase()
  );
  return matched || null;
}

export async function addKey(newKey: UserKey): Promise<{ success: boolean; message?: string }> {
  const keys = await getKeys();
  const trimmedNew = newKey.key.trim().toLowerCase();
  if (keys.some((k) => k && k.key && k.key.trim().toLowerCase() === trimmedNew)) {
    return { success: false, message: 'このキーは既に登録されています' };
  }
  keys.unshift(newKey);
  await saveKeys(keys);
  return { success: true };
}

export async function deleteKey(keyStr: string): Promise<boolean> {
  const keys = await getKeys();
  const trimmed = keyStr.trim().toLowerCase();
  const filtered = keys.filter((k) => !k || !k.key || k.key.trim().toLowerCase() !== trimmed);
  if (filtered.length === keys.length) return false;
  await saveKeys(filtered);
  return true;
}

// --- 記事操作 ---

export async function getPosts(): Promise<Post[]> {
  await ensureFilesExist();
  const postsFile = getPostsFilePath();
  try {
    const data = await fs.readFile(postsFile, 'utf-8');
    const json = JSON.parse(data);
    let posts: Post[] = [];
    if (Array.isArray(json)) {
      posts = json;
    } else if (json && Array.isArray(json.posts)) {
      posts = json.posts;
    }
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error reading posts file:', err);
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
      const postsFile = getPostsFilePath();
      await fs.writeFile(postsFile, JSON.stringify({ posts }, null, 2), 'utf-8');
      return updatedPost;
    }
  }

  const newPost: Post = {
    ...postData,
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(newPost);
  const postsFile = getPostsFilePath();
  await fs.writeFile(postsFile, JSON.stringify({ posts }, null, 2), 'utf-8');
  return newPost;
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  const postsFile = getPostsFilePath();
  await fs.writeFile(postsFile, JSON.stringify({ posts: filtered }, null, 2), 'utf-8');
  return true;
}
