/**
 * Common image transformation parameters used by SaaS image services
 * like Cloudflare Images, Cloudinary, Imgix, etc.
 */

export interface ImageTransformParams {
  // Dimensions
  w?: number;        // Width
  h?: number;        // Height
  dpr?: number;      // Device Pixel Ratio (1, 2, 3 for retina)
  
  // Fit modes
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'crop' | 'pad';
  
  // Format
  f?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'; // Alternative naming
  
  // Quality
  q?: number;        // Quality 1-100
  quality?: number;  // Alternative naming
  
  // Effects
  blur?: number;     // Blur amount
  sharpen?: number;  // Sharpen amount
  brightness?: number;
  contrast?: number;
  gamma?: number;
  
  // Cropping & Gravity
  gravity?: 'auto' | 'center' | 'north' | 'south' | 'east' | 'west' | 'face';
  crop?: string;     // Crop mode
  
  // Background (for padding)
  bg?: string;       // Background color (hex)
  background?: string;
  
  // Rotation
  rotate?: number;   // Degrees
  
  // Metadata
  metadata?: 'keep' | 'copyright' | 'none';
}

/**
 * Common aspect ratios for different use cases
 */
export const ASPECT_RATIOS = {
  // Social Media
  instagram: { w: 1080, h: 1080, ratio: '1:1' },
  instagramPortrait: { w: 1080, h: 1350, ratio: '4:5' },
  instagramLandscape: { w: 1080, h: 608, ratio: '1.91:1' },
  instagramStory: { w: 1080, h: 1920, ratio: '9:16' },
  
  // Standard formats
  landscape: { w: 1920, h: 1080, ratio: '16:9' },
  portrait: { w: 1080, h: 1920, ratio: '9:16' },
  square: { w: 1080, h: 1080, ratio: '1:1' },
  standard: { w: 1600, h: 1200, ratio: '4:3' },
  
  // Web optimized
  thumbnail: { w: 300, h: 300, ratio: '1:1' },
  hero: { w: 1920, h: 600, ratio: '3.2:1' },
  card: { w: 600, h: 400, ratio: '3:2' },
} as const;

/**
 * Build URL with transform parameters
 */
export function buildImageURL(
  baseURL: string,
  params: ImageTransformParams
): string {
  const url = new URL(baseURL);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value.toString());
    }
  });
  
  return url.toString();
}

/**
 * Get responsive image URLs for different breakpoints
 */
export function getResponsiveImageURLs(
  baseURL: string,
  accountHash: string,
  imageId: string
): Record<string, string> {
  const base = `https://imagedelivery.net/${accountHash}/${imageId}/public`;
  
  return {
    // Mobile first approach
    small: buildImageURL(base, { w: 640, f: 'auto', q: 80 }),
    medium: buildImageURL(base, { w: 1024, f: 'auto', q: 85 }),
    large: buildImageURL(base, { w: 1920, f: 'auto', q: 85 }),
    xlarge: buildImageURL(base, { w: 2560, f: 'auto', q: 90 }),
    
    // Retina displays
    smallRetina: buildImageURL(base, { w: 640, dpr: 2, f: 'auto', q: 80 }),
    mediumRetina: buildImageURL(base, { w: 1024, dpr: 2, f: 'auto', q: 85 }),
    
    // Specific aspect ratios with fit=cover
    square: buildImageURL(base, { 
      w: 1080, 
      h: 1080, 
      fit: 'cover', 
      f: 'auto', 
      q: 85 
    }),
    landscape: buildImageURL(base, { 
      w: 1920, 
      h: 1080, 
      fit: 'cover', 
      f: 'auto', 
      q: 85 
    }),
    portrait: buildImageURL(base, { 
      w: 1080, 
      h: 1920, 
      fit: 'cover', 
      f: 'auto', 
      q: 85 
    }),
  };
}