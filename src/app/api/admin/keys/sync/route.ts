import { NextResponse } from 'next/server';
import { saveKeys, findKey } from '@/lib/storage';
import { UserKey } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey) {
      return NextResponse.json({ message: '管理者キーが必要です' }, { status: 401 });
    }

    const user = await findKey(adminKey);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: '管理者権限がありません' }, { status: 403 });
    }

    const body = await req.json();
    const { rawJson } = body;

    let parsedKeys: UserKey[] = [];
    if (typeof rawJson === 'string') {
      const parsed = JSON.parse(rawJson);
      parsedKeys = Array.isArray(parsed) ? parsed : parsed.keys || [];
    } else if (Array.isArray(body.keys)) {
      parsedKeys = body.keys;
    } else {
      return NextResponse.json({ message: '無効なJSONフォーマットです' }, { status: 400 });
    }

    for (const item of parsedKeys) {
      if (!item.key || !item.name) {
        return NextResponse.json({ message: '各キーには key と name が必須です' }, { status: 400 });
      }
      if (!item.role) {
        item.role = 'author';
      }
      if (!item.createdAt) {
        item.createdAt = new Date().toISOString();
      }
    }

    const hasAdmin = parsedKeys.some((k) => k.key === adminKey && k.role === 'admin');
    if (!hasAdmin) {
      parsedKeys.unshift(user);
    }

    await saveKeys(parsedKeys);

    return NextResponse.json({ success: true, keys: parsedKeys });
  } catch (error) {
    console.error('Keys JSON sync error:', error);
    return NextResponse.json({ message: 'JSONの解析または保存に失敗しました' }, { status: 400 });
  }
}
