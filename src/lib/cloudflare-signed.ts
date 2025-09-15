import { MediaItem } from '@/types/review';

// Check if an image/video was uploaded with signed URL requirement
export const requiresSignedUrl = (item: MediaItem): boolean => {
  // You can store this info in metadata or check based on upload date
  // For now, we'll check if the URL doesn't have existing signature
  if ('originalUrl' in item) {
    return !item.originalUrl.includes('?sig=') && !item.originalUrl.includes('public');
  }
  if ('streamUrl' in item) {
    // Stream URLs might have different signing requirements
    return false; // Stream uses different authentication
  }
  return false;
};

// Fetch signed URLs for an image
export const getSignedImageUrls = async (imageId: string) => {
  const response = await fetch('/api/images/signed-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageId }),
  });

  if (!response.ok) {
    throw new Error('Failed to get signed URLs');
  }

  const result = await response.json();
  return result.signedUrls;
};

// Hook to manage signed URLs with caching
export const useSignedUrl = (item: MediaItem | null) => {
  const [signedUrls, setSignedUrls] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item || !requiresSignedUrl(item)) {
      setSignedUrls(null);
      return;
    }

    const fetchSignedUrls = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (item.type === 'image' && item.cloudflareId) {
          const urls = await getSignedImageUrls(item.cloudflareId);
          setSignedUrls(urls);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get signed URLs');
        console.error('Error fetching signed URLs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrls();
  }, [item]);

  return { signedUrls, loading, error };
};

// Component wrapper for signed images
import { useState, useEffect } from 'react';

export const SignedImage: React.FC<{
  src: string;
  imageId?: string;
  alt: string;
  className?: string;
  variant?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
}> = ({ src, imageId, alt, className, variant = 'original' }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if this image needs a signed URL
    if (imageId && !src.includes('?sig=')) {
      setLoading(true);
      
      // Fetch signed URL
      fetch(`/api/images/signed-url?imageId=${imageId}&variant=${variant}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setImageSrc(data.signedUrl);
          }
        })
        .catch(err => {
          console.error('Failed to get signed URL:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [src, imageId, variant]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse`}>
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};

// Utility to get signed URL for direct use
export const getSignedUrl = async (
  imageId: string, 
  variant: string = 'public'
): Promise<string> => {
  const response = await fetch(`/api/images/signed-url?imageId=${imageId}&variant=${variant}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error('Failed to get signed URL');
  }
  
  return data.signedUrl;
};