import { NextResponse } from 'next/server';
import { getPostById, savePost, deletePost, findKey } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ message: '記事が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Fetch post detail error:', error);
    return NextResponse.json({ message: '記事の取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ message: '記事が見つかりません' }, { status: 404 });
    }

    const body = await req.json();
    const { key, title, content, type, videoUrl, coverImage, tags } = body;

    if (!key) {
      return NextResponse.json({ message: 'アクセスキーが必要です' }, { status: 401 });
    }

    const user = await findKey(key);
    if (!user) {
      return NextResponse.json({ message: 'アクセスキーが無効です' }, { status: 403 });
    }

    const isOwner = post.authorKey === user.key;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'この投稿を編集する権限がありません' }, { status: 403 });
    }

    const updatedPost = await savePost({
      id: post.id,
      title: title ? title.trim() : post.title,
      content: content ? content.trim() : post.content,
      authorKey: post.authorKey,
      authorName: post.authorName,
      type: type ? (type === 'vlog' ? 'vlog' : 'blog') : post.type,
      videoUrl: videoUrl !== undefined ? videoUrl.trim() : post.videoUrl,
      coverImage: coverImage !== undefined ? coverImage.trim() : post.coverImage,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : post.tags,
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ message: '記事の更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ message: '記事が見つかりません' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') || req.headers.get('x-access-key');

    if (!key) {
      return NextResponse.json({ message: 'アクセスキーが必要です' }, { status: 401 });
    }

    const user = await findKey(key);
    if (!user) {
      return NextResponse.json({ message: 'アクセスキーが無効です' }, { status: 403 });
    }

    const isOwner = post.authorKey === user.key;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'この投稿を削除する権限がありません' }, { status: 403 });
    }

    const success = await deletePost(id);
    if (!success) {
      return NextResponse.json({ message: '記事の削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '記事を削除しました' });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ message: '記事の削除に失敗しました' }, { status: 500 });
  }
}
