'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserKey, Post } from '@/lib/types';
import Link from 'next/link';
import {
  Shield,
  KeyRound,
  FileText,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Code,
  Save,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Plus,
  PenSquare,
  Video,
  BookOpen,
} from 'lucide-react';

export default function AdminPage() {
  const { key, role, openLoginModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'keys' | 'json' | 'posts'>('keys');
  const [keysList, setKeysList] = useState<UserKey[]>([]);
  const [postsList, setPostsList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyRole, setNewKeyRole] = useState<'author' | 'admin'>('author');
  const [keyError, setKeyError] = useState<string | null>(null);

  const [jsonText, setJsonText] = useState('');
  const [jsonMsg, setJsonMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 管理者パネルからの新規投稿用状態
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postType, setPostType] = useState<'vlog' | 'blog'>('vlog');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postCoverImage, setPostCoverImage] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postFormError, setPostFormError] = useState<string | null>(null);
  const [postSuccessMsg, setPostSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (key && role === 'admin') {
      loadData();
    }
  }, [key, role]);

  const loadData = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const resKeys = await fetch('/api/admin/keys', {
        headers: { 'x-admin-key': key },
      });
      const dataKeys = await resKeys.json();
      if (resKeys.ok && dataKeys.keys) {
        setKeysList(dataKeys.keys);
        setJsonText(JSON.stringify({ keys: dataKeys.keys }, null, 2));
      }

      const resPosts = await fetch('/api/posts');
      const dataPosts = await resPosts.json();
      if (resPosts.ok && dataPosts.posts) {
        setPostsList(dataPosts.posts);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomKey = () => {
    const rand = Math.random().toString(36).substring(2, 8);
    setNewKeyValue(`friend-${rand}`);
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;
    setKeyError(null);

    if (!newKeyName.trim() || !newKeyValue.trim()) {
      setKeyError('名前とキー文字列を入力してください');
      return;
    }

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key,
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
          key: newKeyValue.trim(),
          role: newKeyRole,
        }),
      });

      const data = await res.json();
      if (res.ok && data.keys) {
        setKeysList(data.keys);
        setJsonText(JSON.stringify({ keys: data.keys }, null, 2));
        setNewKeyName('');
        setNewKeyValue('');
      } else {
        setKeyError(data.message || 'キーの追加に失敗しました');
      }
    } catch (err) {
      setKeyError('通信エラーが発生しました');
    }
  };

  const handleDeleteKey = async (targetKey: string) => {
    if (!key) return;
    if (!confirm(`キー「${targetKey}」を削除しますか？該当ユーザーは投稿できなくなります。`)) return;

    try {
      const res = await fetch(`/api/admin/keys?key=${encodeURIComponent(targetKey)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': key },
      });
      const data = await res.json();
      if (res.ok && data.keys) {
        setKeysList(data.keys);
        setJsonText(JSON.stringify({ keys: data.keys }, null, 2));
      } else {
        alert(data.message || 'キーの削除に失敗しました');
      }
    } catch (err) {
      alert('削除通信エラーが発生しました');
    }
  };

  const handleSaveJson = async () => {
    if (!key) return;
    setJsonMsg(null);
    try {
      const res = await fetch('/api/admin/keys/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key,
        },
        body: JSON.stringify({ rawJson: jsonText }),
      });
      const data = await res.json();
      if (res.ok && data.keys) {
        setKeysList(data.keys);
        setJsonMsg({ text: 'JSON設定を保存・同期しました！', type: 'success' });
      } else {
        setJsonMsg({ text: data.message || 'JSONの反映に失敗しました', type: 'error' });
      }
    } catch (err) {
      setJsonMsg({ text: '構文エラーまたは通信エラーです', type: 'error' });
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!key) return;
    if (!confirm(`管理者権限で記事「${postTitle}」を削除しますか？`)) return;

    try {
      const res = await fetch(`/api/posts/${postId}?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setPostsList((prev) => prev.filter((p) => p.id !== postId));
        alert('記事を削除しました');
      } else {
        alert(data.message || '削除に失敗しました');
      }
    } catch (err) {
      alert('通信エラーが発生しました');
    }
  };

  // 管理者パネルからの新規投稿処理
  const handleCreatePostAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;
    setPostFormError(null);
    setPostSuccessMsg(null);

    if (!postTitle.trim()) {
      setPostFormError('タイトルを入力してください');
      return;
    }
    if (!postContent.trim()) {
      setPostFormError('本文を入力してください');
      return;
    }
    if (postType === 'vlog' && !postVideoUrl.trim()) {
      setPostFormError('Vlog投稿の場合は動画URL（YouTube等）を入力してください');
      return;
    }

    const tags = postTags
      .split(/[,、]/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    setPostSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          title: postTitle.trim(),
          content: postContent.trim(),
          type: postType,
          videoUrl: postVideoUrl.trim(),
          coverImage: postCoverImage.trim(),
          tags,
        }),
      });

      const data = await res.json();
      if (res.ok && data.post) {
        setPostsList((prev) => [data.post, ...prev]);
        setPostSuccessMsg('記事を新しく公開しました！');
        setPostTitle('');
        setPostVideoUrl('');
        setPostCoverImage('');
        setPostContent('');
        setPostTags('');
        setShowNewPostForm(false);
      } else {
        setPostFormError(data.message || '投稿の作成に失敗しました');
      }
    } catch (err) {
      setPostFormError('通信エラーが発生しました');
    } finally {
      setPostSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!key || role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">管理者権限が必要です</h2>
        <p className="text-sm text-slate-600 mb-6">
          このページは管理者キー（role: admin）をお持ちの方のみアクセスできます。
        </p>
        <button
          onClick={openLoginModal}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition"
        >
          管理者キーで認証する
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">管理者パネル</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              参加者キーの発行・JSON管理、およびサイト全体の投稿を管理します
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('keys')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'keys'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>キー管理</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'json'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4 text-indigo-500" />
            <span>JSON直貼り・編集</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'posts'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>投稿一覧管理 ({postsList.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'keys' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>新しいキーを発行</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">友達に共有するアクセスキーを登録します</p>

            {keyError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs mb-4 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{keyError}</span>
              </div>
            )}

            <form onSubmit={handleAddKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">友達の名前 / ニックネーム</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="例: ケンジ / さくら"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">アクセスキー文字列</label>
                  <button
                    type="button"
                    onClick={generateRandomKey}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ランダム生成</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="例: friend-kenji"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">権限ロール</label>
                <select
                  value={newKeyRole}
                  onChange={(e) => setNewKeyRole(e.target.value as 'author' | 'admin')}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                >
                  <option value="author">投稿者 (author) - 記事の投稿・編集が可能</option>
                  <option value="admin">管理者 (admin) - キー発行や全記事管理が可能</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition"
              >
                キーを登録する
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>登録済みアクセスキー ({keysList.length})</span>
              </h3>
              <p className="text-xs text-slate-400">キーをクリックしてコピーできます</p>
            </div>

            <div className="divide-y divide-slate-100">
              {keysList.map((item) => (
                <div key={item.key} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{item.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {item.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                        {item.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(item.key)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-0.5"
                        title="キーをコピー"
                      >
                        {copiedKey === item.key ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px] text-emerald-600 font-semibold">コピー済</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">コピー</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {item.key !== key ? (
                      <button
                        onClick={() => handleDeleteKey(item.key)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="キーを削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">ログイン中</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'json' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <span>keys.json 直接編集・貼り付け</span>
              </h3>
              <p className="text-xs text-slate-500">
                JSONテキストを直接貼り付けて保存するか、コピーして手元のファイルと同期できます。
              </p>
            </div>
            <button
              onClick={handleSaveJson}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition w-fit"
            >
              <Save className="w-4 h-4" />
              <span>JSONを反映・保存</span>
            </button>
          </div>

          {jsonMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                jsonMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {jsonMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{jsonMsg.text}</span>
            </div>
          )}

          <div className="relative">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={16}
              className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-900 text-emerald-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-inner"
              spellCheck={false}
            />
          </div>

          <p className="text-xs text-slate-400">
            ※ ファイルの直接編集（<code>data/keys.json</code>）でも即座に同期されます。
          </p>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>全記事の統括・作成管理</span>
              </h3>
              <p className="text-xs text-slate-500">管理者として記事の新規投稿、確認、強制削除ができます</p>
            </div>
            <button
              onClick={() => {
                setShowNewPostForm(!showNewPostForm);
                setPostSuccessMsg(null);
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>{showNewPostForm ? 'フォームを閉じる' : '新しい投稿を追加'}</span>
            </button>
          </div>

          {postSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{postSuccessMsg}</span>
            </div>
          )}

          {/* 新規投稿フォーム（トグル表示） */}
          {showNewPostForm && (
            <form onSubmit={handleCreatePostAdmin} className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                <PenSquare className="w-4 h-4 text-emerald-600" />
                <span>管理者として記事を投稿する</span>
              </h4>

              {postFormError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{postFormError}</span>
                </div>
              )}

              {/* タイプ切り替え */}
              <div className="flex items-center space-x-2 bg-white p-1 rounded-xl w-fit border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPostType('vlog')}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    postType === 'vlog' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Vlog (動画)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('blog')}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    postType === 'blog' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Blog (記事)</span>
                </button>
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">タイトル *</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="例: おすすめスポット紹介 / 最新Vlog"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>

              {/* Vlog用動画URL */}
              {postType === 'vlog' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">YouTube / Vimeo 動画URL *</label>
                  <input
                    type="url"
                    value={postVideoUrl}
                    onChange={(e) => setPostVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    required
                  />
                </div>
              )}

              {/* カバー画像URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">カバー画像URL (任意)</label>
                <input
                  type="url"
                  value={postCoverImage}
                  onChange={(e) => setPostCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              {/* 本文 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">本文 (Markdown対応) *</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                  placeholder="記事の本文を入力してください（見出しは ##、箇条書きは -）"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>

              {/* タグ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">タグ (カンマ区切り)</label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="キャンプ, 休日, Vlog"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={postSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {postSubmitting ? '保存中...' : '管理者として公開する'}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">種別</th>
                  <th className="py-3 px-4">タイトル</th>
                  <th className="py-3 px-4">投稿者</th>
                  <th className="py-3 px-4">投稿日</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {postsList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.type === 'vlog' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {p.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      <Link href={`/posts/${p.id}`} className="hover:underline flex items-center space-x-1">
                        <span>{p.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 inline" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{p.authorName}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePost(p.id, p.title)}
                        className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>強制削除</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
