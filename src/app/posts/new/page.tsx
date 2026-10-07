'use client';

import React from 'react';
import PostForm from '@/components/PostForm';
import { PenSquare } from 'lucide-react';

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
          <PenSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">新しい記事・Vlogを投稿</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            YouTube動画のURLや写真、日々のストーリーをシェアしましょう
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <PostForm />
      </div>
    </div>
  );
}
