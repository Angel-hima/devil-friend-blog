'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Video, PenSquare, Shield, LogOut, KeyRound, User } from 'lucide-react';

export default function Navbar() {
  const { key, name, role, isLoading, openLoginModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
              Friends Vlog & Blog
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {key ? (
            <Link
              href="/posts/new"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
            >
              <PenSquare className="w-4 h-4" />
              <span>投稿する</span>
            </Link>
          ) : (
            <button
              onClick={openLoginModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition"
            >
              <PenSquare className="w-4 h-4" />
              <span>投稿する</span>
            </button>
          )}

          {role === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-sm font-semibold border border-amber-200 transition"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">管理者パネル</span>
            </Link>
          )}

          {!isLoading && (
            <>
              {key ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                  <div className="flex items-center space-x-1.5 text-xs sm:text-sm bg-gray-100 py-1.5 px-3 rounded-full text-gray-700">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-medium max-w-[100px] truncate">{name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${role === 'admin' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'}`}>
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="ログアウト"
                    className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="inline-flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
                >
                  <KeyRound className="w-4 h-4 text-gray-500" />
                  <span>キー認証</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
