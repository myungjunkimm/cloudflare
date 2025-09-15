import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error('Cloudflare credentials not configured');
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '48';

    // Cloudflare Images API를 통해 이미지 목록 조회 (v1 API 사용)
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        }
      }
    );

    const responseText = await response.text();
    console.log('List images - Status:', response.status);
    console.log('List images - Response:', responseText);

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Parsed data structure:', {
      hasResult: !!data.result,
      hasImages: !!data.result?.images,
      imageCount: data.result?.images?.length || 0
    });
    
    // Transform the response to include display URLs with optimization parameters
    const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'ydJcczaKlrbCH-7R2wtX_w';
    const transformedImages = (data.result?.images || []).map((image: any) => ({
      ...image,
      // Common transform parameters for image SaaS:
      // f=auto: Auto format (WebP/AVIF)
      // fit=cover: Preserves aspect ratio, crops if needed (Instagram-style)
      // fit=contain: Preserves aspect ratio, adds padding if needed
      // fit=scale-down: Never enlarges, only shrinks
      // w=width, h=height: Dimensions
      // q=quality: 1-100 (default 85)
      // sharpen=amount: Sharpening after resize
      displayURL: `https://imagedelivery.net/${accountHash}/${image.id}/public?f=auto`,
      
      // Gallery thumbnail - using standardThumbnail variant (150x150 square crop)
      // Cloudflare variants already handle the cropping/fitting
      thumbnailURL: `https://imagedelivery.net/${accountHash}/${image.id}/standardThumbnail?f=auto`,
      
      // For larger grid items, use a bigger square variant or resize
      squareURL: `https://imagedelivery.net/${accountHash}/${image.id}/reviewMedium?f=auto`,
      
      // Additional responsive variants
      responsiveURLs: {
        // 16:9 landscape
        landscape: `https://imagedelivery.net/${accountHash}/${image.id}/public?f=auto&fit=cover&w=1920&h=1080&q=85`,
        // 9:16 portrait (stories/reels)  
        portrait: `https://imagedelivery.net/${accountHash}/${image.id}/public?f=auto&fit=cover&w=1080&h=1920&q=85`,
        // 4:3 standard
        standard: `https://imagedelivery.net/${accountHash}/${image.id}/public?f=auto&fit=cover&w=1600&h=1200&q=85`,
        // Original with optimization only
        optimized: `https://imagedelivery.net/${accountHash}/${image.id}/public?f=auto&q=90`
      }
    }));
    
    return NextResponse.json({
      success: true,
      images: transformedImages,
      total: data.result?.total || 0,
      page: parseInt(page),
      perPage: parseInt(perPage)
    });
    
  } catch (error) {
    console.error('Error listing images:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to list images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}