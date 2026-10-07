import { NextResponse } from 'next/server';
import { findKey } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, message: 'キーが指定されていません' }, { status: 400 });
    }

    const matched = await findKey(key);

    if (!matched) {
      return NextResponse.json({ valid: false, message: '無効なアクセスキーです' }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      name: matched.name,
      role: matched.role,
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ valid: false, message: 'サーバー内部エラーが発生しました' }, { status: 500 });
  }
}
