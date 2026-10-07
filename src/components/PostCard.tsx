'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { parseVideoUrl } from '@/lib/video';
import { useAuth } from '@/context/AuthContext';
import { Video, BookOpen, Calendar, User, Trash2 } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onDeleted?: (postId: string) => void;
}

export default function PostCard({ post, onDeleted }: PostCardProps) {
  const { key, role } = useAuth();
  const [deleting, setDeleting] = useState(false);

  let thumbnail = post.coverImage;
  if (!thumbnail && post.videoUrl) {
    const { platform, videoId } = parseVideoUrl(post.videoUrl);
    if (platform === 'youtube' && videoId) {
      thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  const dateStr = new Date(post.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const canDelete = Boolean(key && (post.authorKey === key || role === 'admin'));

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`記事「${post.title}」を削除しますか？`)) return;
    if (!key) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/posts/${post.id}?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        if (onDeleted) {
          onDeleted(post.id);
        } else {
          window.location.reload();
        }
      } else {
        alert(data.message || '削除に失敗しました');
      }
    } catch (err) {
      console.error('Delete post error:', err);
      alert('通信エラーが発生しました');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1 relative">
      <Link href={`/posts/${post.id}`} className="block relative aspect-video overflow-hidden bg-slate-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-slate-400">
            {post.type === 'vlog' ? (
              <Video className="w-12 h-12 text-indigo-300" />
            ) : (
              <BookOpen className="w-12 h-12 text-slate-300" />
            )}
          </div>
        )}

        {/* タイプバッジ */}
        <div className="absolute top-3 left-3">
          {post.type === 'vlog' ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md">
              <Video className="w-3.5 h-3.5" />
              <span>Vlog</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blog</span>
            </span>
          )}
        </div>

        {/* 削除ボタン（本人または管理者の場合のみ表示） */}
        {canDelete && (
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="記事を削除"
              className="p-2 rounded-xl bg-black/60 hover:bg-red-600 text-white backdrop-blur-sm transition shadow-md group-hover:opacity-100 opacity-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-2">
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </h3>

          <p className="text-sm text-slate-700 line-clamp-2 mb-4 leading-relaxed font-normal">
            {post.content.replace(/[#*`_-]/g, '')}
          </p>
        </div>

        <div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-xs text-indigo-900 bg-indigo-100/90 px-2.5 py-1 rounded-md font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                <User className="w-3 h-3" />
              </div>
              <span>{post.authorName}</span>
            </div>
            <div className="flex items-center space-x-1 font-medium text-slate-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
