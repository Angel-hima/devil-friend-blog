import { NextResponse } from 'next/server';
import { getPosts, savePost, findKey } from '@/lib/storage';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const type = searchParams.get('type');

    let posts = await getPosts();

    if (tag) {
      posts = posts.filter((p) => p.tags?.includes(tag));
    }
    if (author) {
      posts = posts.filter((p) => p.authorName === author);
    }
    if (type && (type === 'vlog' || type === 'blog')) {
      posts = posts.filter((p) => p.type === type);
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ message: '記事一覧の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, title, content, type, videoUrl, coverImage, tags } = body;

    if (!key) {
      return NextResponse.json({ message: 'アクセスキーが必要です' }, { status: 401 });
    }

    const user = await findKey(key);
    if (!user) {
      return NextResponse.json({ message: 'アクセスキーが無効です' }, { status: 403 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ message: 'タイトルを入力してください' }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ message: '本文を入力してください' }, { status: 400 });
    }

    const newPost = await savePost({
      title: title.trim(),
      content: content.trim(),
      authorKey: user.key,
      authorName: user.name,
      type: type === 'vlog' ? 'vlog' : 'blog',
      videoUrl: videoUrl ? videoUrl.trim() : '',
      coverImage: coverImage ? coverImage.trim() : '',
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ message: '記事の作成に失敗しました' }, { status: 500 });
  }
}
