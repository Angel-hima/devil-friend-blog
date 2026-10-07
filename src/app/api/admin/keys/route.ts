import { NextResponse } from 'next/server';
import { getKeys, addKey, deleteKey, findKey } from '@/lib/storage';
import { UserRole } from '@/lib/types';

async function checkAdmin(req: Request): Promise<{ isAdmin: boolean; error?: NextResponse }> {
  const adminKey = req.headers.get('x-admin-key');
  if (!adminKey) {
    return { isAdmin: false, error: NextResponse.json({ message: '管理者キーが必要です' }, { status: 401 }) };
  }

  const user = await findKey(adminKey);
  if (!user || user.role !== 'admin') {
    return { isAdmin: false, error: NextResponse.json({ message: '管理者権限がありません' }, { status: 403 }) };
  }

  return { isAdmin: true };
}

export async function GET(req: Request) {
  const check = await checkAdmin(req);
  if (!check.isAdmin) return check.error!;

  try {
    const keys = await getKeys();
    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Fetch keys error:', error);
    return NextResponse.json({ message: 'キー一覧の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const check = await checkAdmin(req);
  if (!check.isAdmin) return check.error!;

  try {
    const body = await req.json();
    const { key, name, role } = body;

    if (!key || !key.trim()) {
      return NextResponse.json({ message: 'キー文字列を入力してください' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'ユーザー名を入力してください' }, { status: 400 });
    }

    const assignedRole: UserRole = role === 'admin' ? 'admin' : 'author';

    const result = await addKey({
      key: key.trim(),
      name: name.trim(),
      role: assignedRole,
      createdAt: new Date().toISOString(),
    });

    if (!result.success) {
      return NextResponse.json({ message: result.message || 'キーの追加に失敗しました' }, { status: 400 });
    }

    const keys = await getKeys();
    return NextResponse.json({ success: true, keys });
  } catch (error) {
    console.error('Add key error:', error);
    return NextResponse.json({ message: 'キーの追加に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const check = await checkAdmin(req);
  if (!check.isAdmin) return check.error!;

  try {
    const { searchParams } = new URL(req.url);
    const targetKey = searchParams.get('key');

    if (!targetKey) {
      return NextResponse.json({ message: '削除対象のキーが指定されていません' }, { status: 400 });
    }

    const currentAdminKey = req.headers.get('x-admin-key');
    if (currentAdminKey === targetKey) {
      return NextResponse.json({ message: '現在ログイン中の管理者キーは削除できません' }, { status: 400 });
    }

    const deleted = await deleteKey(targetKey);
    if (!deleted) {
      return NextResponse.json({ message: '指定されたキーが見つかりませんでした' }, { status: 404 });
    }

    const keys = await getKeys();
    return NextResponse.json({ success: true, keys });
  } catch (error) {
    console.error('Delete key error:', error);
    return NextResponse.json({ message: 'キーの削除に失敗しました' }, { status: 500 });
  }
}
