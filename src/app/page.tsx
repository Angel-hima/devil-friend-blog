'use client';

import React, { useEffect, useState } from 'react';
import { Post } from '@/lib/types';
import PostCard from '@/components/PostCard';
import { Video, BookOpen, Sparkles, Filter, Search } from 'lucide-react';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'vlog' | 'blog'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (res.ok && data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  );

  const filteredPosts = posts.filter((post) => {
    const matchesType = selectedType === 'all' || post.type === selectedType;
    const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
    const matchesSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesTag && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white p-8 sm:p-12 mb-10 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-4 text-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Friends Shared Space</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            友達とつくる、<br />動画と日常の記録
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            YouTube動画のシェアから、週末のキャンプやお気に入りカフェの思い出まで。
            招待キーを持った仲間と一緒に投稿できるオープンなVlog・Blogスペースです。
          </p>
        </div>
      </section>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              selectedType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setSelectedType('vlog')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              selectedType === 'vlog'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Vlog</span>
          </button>
          <button
            onClick={() => setSelectedType('blog')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              selectedType === 'blog'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blog</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトル・本文・投稿者を検索..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>タグ:</span>
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition flex-shrink-0 ${
              selectedTag === null
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            すべて
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition flex-shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100 p-4 flex flex-col justify-between">
              <div className="bg-slate-200 h-44 rounded-xl mb-4" />
              <div className="space-y-2">
                <div className="bg-slate-200 h-4 rounded w-3/4" />
                <div className="bg-slate-200 h-3 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">投稿が見つかりませんでした</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            条件に一致する記事がないか、まだ投稿されていません。右上の「投稿する」ボタンから記事を追加してみましょう！
          </p>
        </div>
      )}
    </div>
  );
}
