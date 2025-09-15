export interface CloudflareConfig {
  apiKey: string;
  accountId: string;
  accountHash: string;
}

let cloudflareConfig: CloudflareConfig | null = null;

export const setCloudflareConfig = (config: CloudflareConfig) => {
  cloudflareConfig = config;
};

export const getCloudflareConfig = (): CloudflareConfig => {
  if (!cloudflareConfig) {
    throw new Error('Cloudflare configuration not set');
  }
  return cloudflareConfig;
};

export const uploadToCloudflareImages = async (file: File): Promise<{
  id: string;
  originalUrl: string;
  webpUrl: string;
  thumbnailUrl: string;
  variants: {
    small: string;
    medium: string;
    large: string;
    webp: string;
  };
}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to upload image');
  }
  
  return result.result;
};

export const uploadToCloudflareStream = async (file: File): Promise<{
  id: string;
  streamUrl: string;
  thumbnailUrl: string;
  animatedThumbnailUrl: string;
}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/video', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to upload video');
  }
  
  return result.result;
};