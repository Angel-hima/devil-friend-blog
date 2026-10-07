'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginModal() {
  const { isModalOpen, closeLoginModal, login } = useAuth();
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!inputKey.trim()) {
      setError('アクセスキーを入力してください');
      return;
    }

    setLoading(true);
    const result = await login(inputKey.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.message || '認証に失敗しました');
    } else {
      setInputKey('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-6 h-6 text-indigo-200" />
            <h2 className="text-xl font-bold">メンバー認証</h2>
          </div>
          <button
            onClick={closeLoginModal}
            className="text-white/80 hover:text-white transition p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            記事の投稿や管理を行うには、招待されたアクセスキーを入力してください。
          </p>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アクセスキー
            </label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="例: friend-key-alice や admin-master-key-777"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-mono text-sm"
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-md transition duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>認証する</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-xl text-xs text-indigo-900 space-y-1">
            <p className="font-semibold text-indigo-950">💡 初期設定キーのサンプル:</p>
            <p>• 友達用: <code className="bg-white/80 px-1 py-0.5 rounded text-indigo-700">friend-key-alice</code> / <code className="bg-white/80 px-1 py-0.5 rounded text-indigo-700">friend-key-bob</code></p>
            <p>• 管理者用: <code className="bg-white/80 px-1 py-0.5 rounded text-indigo-700">admin-master-key-777</code></p>
          </div>
        </form>
      </div>
    </div>
  );
}
