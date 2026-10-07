export interface VideoEmbedInfo {
  platform: 'youtube' | 'vimeo' | 'unknown';
  embedUrl: string | null;
  videoId: string | null;
}

export function parseVideoUrl(url: string | undefined): VideoEmbedInfo {
  if (!url || typeof url !== 'string') {
    return { platform: 'unknown', embedUrl: null, videoId: null };
  }

  const trimmed = url.trim();

  // YouTube判定
  const ytMatch =
    trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/) ||
    trimmed.match(/^[a-zA-Z0-9_-]{11}$/);

  if (ytMatch) {
    const videoId = ytMatch[1] || ytMatch[0];
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      videoId,
    };
  }

  // Vimeo判定
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      videoId,
    };
  }

  return {
    platform: 'unknown',
    embedUrl: null,
    videoId: null,
  };
}
