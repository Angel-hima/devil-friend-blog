'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PostForm from '@/components/PostForm';
import { Post } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Edit3, AlertCircle } from 'lucide-react';

function EditPostContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { key, role } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (res.ok && data.post) {
          setPost(data.post);
        } else {
          setError(data.message || '記事が見つかりません');
        }
      } catch (err) {
        console.error('Fetch post error:', err);
        setError('記事の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">記事データを読み込んでいます...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">エラー</h2>
        <p className="text-sm text-slate-500 mb-6">{error || '記事が見つかりませんでした'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold"
        >
          トップへ戻る
        </button>
      </div>
    );
  }

  const canEdit = key && (post.authorKey === key || role === 'admin');
  if (!canEdit) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">権限がありません</h2>
        <p className="text-sm text-slate-500 mb-6">
          この記事を編集できるのは投稿者本人（または管理者）のみです。
        </p>
        <button
          onClick={() => router.push(`/posts/${id}`)}
          className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold"
        >
          記事詳細へ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
          <Edit3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">記事を編集</h1>
          <p className="text-xs sm:text-sm text-slate-500">投稿内容の修正・更新を行います</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <PostForm initialData={post} isEdit={true} />
      </div>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">読み込んでいます...</p>
        </div>
      }
    >
      <EditPostContent />
    </Suspense>
  );
}
