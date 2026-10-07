'use client';

import React from 'react';
import { parseVideoUrl } from '@/lib/video';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  url?: string;
  className?: string;
}

export default function VideoPlayer({ url, className = '' }: VideoPlayerProps) {
  if (!url) return null;

  const { platform, embedUrl } = parseVideoUrl(url);

  if (!embedUrl) {
    return (
      <div className={`aspect-video w-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6 ${className}`}>
        <PlayCircle className="w-12 h-12 mb-2 text-slate-500" />
        <p className="text-sm font-medium">サポートされていない動画URLです</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 underline mt-2 hover:text-indigo-300"
        >
          直接リンクを開く
        </a>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-black ${className}`}>
      <iframe
        src={embedUrl}
        title="動画プレイヤー"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
