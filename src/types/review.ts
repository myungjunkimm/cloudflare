export interface MediaItem {
  type: 'image' | 'video';
  fileName: string;
  cloudflareId: string;
  isRepresentative: boolean;
  requiresSignedUrl?: boolean;
  
  // Image specific
  originalUrl?: string;
  webpUrl?: string;
  thumbnailUrl?: string;
  variants?: {
    small: string;
    medium: string;
    large: string;
    webp: string;
  };
  
  // Video specific  
  streamUrl?: string;
  hlsUrl?: string;
  dashUrl?: string;
  animatedThumbnailUrl?: string;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  media: MediaItem[];
  createdAt: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}