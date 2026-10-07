'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post, PostType } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import VideoPlayer from '@/components/VideoPlayer';
import ReactMarkdown from 'react-markdown';
import {
  Video,
  BookOpen,
  Image,
  Tag,
  Eye,
  Edit3,
  Send,
  AlertCircle,
} from 'lucide-react';

interface PostFormProps {
  initialData?: Partial<Post>;
  isEdit?: boolean;
}

export default function PostForm({ initialData, isEdit = false }: PostFormProps) {
  const router = useRouter();
  const { key, openLoginModal } = useAuth();

  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<PostType>(initialData?.type || 'vlog');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!key) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">ログインが必要です</h2>
        <p className="text-sm text-slate-600 mb-6">
          投稿や編集を行うには、あなたのアクセスキーでログインしてください。
        </p>
        <button
          onClick={openLoginModal}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:bg-indigo-700 transition"
        >
          キーを入力して認証する
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    if (!content.trim()) {
      setError('本文を入力してください');
      return;
    }
    if (type === 'vlog' && !videoUrl.trim()) {
      setError('Vlog投稿の場合は動画URL（YouTube等）を入力してください');
      return;
    }

    const tags = tagsInput
      .split(/[,、]/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    setSubmitting(true);

    try {
      const payload = {
        key,
        title: title.trim(),
        content: content.trim(),
        type,
        videoUrl: videoUrl.trim(),
        coverImage: coverImage.trim(),
        tags,
      };

      const url = isEdit ? `/api/posts/${initialData?.id}` : '/api/posts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const targetId = isEdit ? initialData?.id : data.post?.id;
        router.push(targetId ? `/posts/${targetId}` : '/');
      } else {
        setError(data.message || '保存に失敗しました');
      }
    } catch (err) {
      console.error('Save post error:', err);
      setError('通信エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center space-x-3 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setType('vlog')}
          className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            type === 'vlog'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Vlog (動画メイン)</span>
        </button>
        <button
          type="button"
          onClick={() => setType('blog')}
          className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            type === 'blog'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Blog (記事・写真)</span>
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">タイトル *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 週末のキャンプ記録 / 街歩きVlog"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 text-lg shadow-sm"
          required
        />
      </div>

      {type === 'vlog' && (
        <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3">
          <label className="block text-sm font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Video className="w-4 h-4 text-rose-500" />
              <span>YouTube / Vimeo 動画URL *</span>
            </span>
            <span className="text-xs font-normal text-slate-500">
              通常URL、短縮URL(youtu.be)、Shortsに対応
            </span>
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2.5 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-900 text-sm shadow-sm"
            required={type === 'vlog'}
          />
          {videoUrl.trim() && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-rose-800 block mb-2">動画プレビュー:</span>
              <div className="max-w-md">
                <VideoPlayer url={videoUrl} />
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
          <Image className="w-4 h-4 text-slate-500" />
          <span>カバー画像 URL (任意)</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          未入力の場合、VlogではYouTubeサムネイルが自動適用されます。
        </p>
        <input
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm shadow-sm"
        />
        {coverImage && (
          <div className="mt-2 max-w-xs aspect-video rounded-xl overflow-hidden border border-slate-200">
            <img src={coverImage} alt="カバープレビュー" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-700">本文 (Markdown対応) *</label>
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                !previewMode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>編集</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                previewMode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>プレビュー</span>
            </button>
          </div>
        </div>

        {previewMode ? (
          <div className="w-full min-h-[260px] p-5 bg-white border border-slate-200 rounded-2xl prose prose-slate max-w-none text-slate-800 shadow-sm">
            {content.trim() ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-slate-400 italic">本文がまだ入力されていません</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="見出しは ##、箇条書きは - で書けます。旅の思い出や動画の見どころを自由に執筆してください。"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm shadow-sm font-sans"
            required
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
          <Tag className="w-4 h-4 text-slate-500" />
          <span>タグ (カンマ区切り)</span>
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="キャンプ, 休日, Vlog, カフェ巡り"
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm shadow-sm"
        />
      </div>

      <div className="pt-4 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{isEdit ? '更新する' : '公開する'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
