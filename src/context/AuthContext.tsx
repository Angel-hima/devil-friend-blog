'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/lib/types';

interface AuthContextType {
  key: string | null;
  name: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (key: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'vlog_blog_app_access_key';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) {
      verifyAndSetKey(savedKey).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAndSetKey = async (inputKey: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputKey }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setKey(inputKey);
        setName(data.name || 'メンバー');
        setRole(data.role || 'author');
        localStorage.setItem(STORAGE_KEY, inputKey);
        return { success: true };
      } else {
        return { success: false, message: data.message || '無効なアクセスキーです' };
      }
    } catch (err) {
      console.error('Login verification error:', err);
      return { success: false, message: '通信エラーが発生しました' };
    }
  };

  const login = async (inputKey: string) => {
    const res = await verifyAndSetKey(inputKey);
    if (res.success) {
      setIsModalOpen(false);
    }
    return res;
  };

  const logout = () => {
    setKey(null);
    setName(null);
    setRole(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const openLoginModal = () => setIsModalOpen(true);
  const closeLoginModal = () => setIsModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        key,
        name,
        role,
        isLoading,
        login,
        logout,
        isModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
