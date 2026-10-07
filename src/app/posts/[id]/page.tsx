'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import VideoPlayer from '@/components/VideoPlayer';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Calendar,
  User,
  Video,
  BookOpen,
  Edit,
  Trash2,
  Tag,
  Share2,
  Check,
} from 'lucide-react';

function PostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { key, role } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

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
          setError(data.message || '記事が見つかりませんでした');
        }
      } catch (err) {
        console.error('Fetch post detail failed:', err);
        setError('記事の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const canModify = post && key && (post.authorKey === key || role === 'admin');

  const handleDelete = async () => {
    if (!confirm('本当にこの記事を削除しますか？')) return;
    if (!key) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/posts/${id}?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert('記事を削除しました');
        router.push('/');
      } else {
        alert(data.message || '削除に失敗しました');
      }
    } catch (err) {
      console.error('Delete post failed:', err);
      alert('削除処理中にエラーが発生しました');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">記事を読み込んでいます...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">記事が見つかりません</h2>
        <p className="text-sm text-slate-500 mb-6">{error || '指定された記事は存在しないか削除されました。'}</p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>トップへ戻る</span>
        </Link>
      </div>
    );
  }

  const dateStr = new Date(post.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>一覧へ戻る</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'コピーしました！' : 'リンクをコピー'}</span>
          </button>

          {canModify && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <Link
                href={`/posts/${post.id}/edit`}
                className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>編集</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>削除</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center space-x-2">
          {post.type === 'vlog' ? (
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
              <Video className="w-3.5 h-3.5" />
              <span>Vlog 動画</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blog 記事</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-2 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-1.5 font-medium text-slate-700">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>{post.authorName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      {post.type === 'vlog' && post.videoUrl && (
        <div className="mb-8">
          <VideoPlayer url={post.videoUrl} />
        </div>
      )}

      {post.coverImage && (!post.videoUrl || post.type === 'blog') && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-md max-h-[500px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm mb-8">
        <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed font-normal prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-slate-800 prose-li:text-slate-800">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center space-x-2 pt-2">
          <Tag className="w-4 h-4 text-slate-600" />
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-xs font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-xl"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default function PostDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">読み込んでいます...</p>
        </div>
      }
    >
      <PostDetailContent />
    </Suspense>
  );
}
