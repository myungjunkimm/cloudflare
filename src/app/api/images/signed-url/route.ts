import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Cloudflare Images signed URL generation
// Reference: https://developers.cloudflare.com/images/cloudflare-images/serve-images/serve-private-images/

export async function POST(request: NextRequest) {
  try {
    const { imageId, variant = 'public' } = await request.json();
    
    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH || process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;

    if (!accountHash) {
      return NextResponse.json({ error: 'Account hash not configured' }, { status: 500 });
    }
    
    // URL signing key from environment variable
    const urlSigningKey = process.env.CLOUDFLARE_IMAGES_SIGNING_KEY;
    
    if (!urlSigningKey) {
      return NextResponse.json({ error: 'Signing key not configured' }, { status: 500 });
    }
    
    // Set expiration time (1 hour from now)
    const expiry = Math.floor(Date.now() / 1000) + 3600;
    
    // Construct the URL path
    const urlPath = `/${accountHash}/${imageId}/${variant}`;
    
    // Create the string to sign
    const stringToSign = urlPath + '?exp=' + expiry;
    
    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', urlSigningKey)
      .update(stringToSign)
      .digest('hex');
    
    // Construct the final signed URL
    const signedUrl = `https://imagedelivery.net${urlPath}?exp=${expiry}&sig=${signature}`;
    
    // Generate signed URLs for different variants with transform parameters
    const generateSignedUrl = (variantName: string) => {
      const path = `/${accountHash}/${imageId}/${variantName}`;
      const exp = Math.floor(Date.now() / 1000) + 3600;
      
      // Sign only path + exp
      const strToSign = path + '?exp=' + exp;
      const sig = crypto
        .createHmac('sha256', urlSigningKey)
        .update(strToSign)
        .digest('hex');
      
      // Add transform parameters after signing
      let transformParams = '';
      switch (variantName) {
        case 'public':
          transformParams = '&f=auto&fit=contain&q=90';  // 상세보기용
          break;
        case 'reviewMedium':
          transformParams = '&f=auto';  // Public Gallery와 동일
          break;
        case 'standardThumbnail':
          transformParams = '&f=auto&fit=cover&w=300&h=300&q=80';  // 기본 썸네일용
          break;
        case 'w=400':
          transformParams = '&f=auto&fit=scale-down&q=85';
          break;
        case 'w=800':
          transformParams = '&f=auto&fit=scale-down&q=85';
          break;
        case 'w=1920':
          transformParams = '&f=auto&fit=scale-down&q=85';
          break;
        case 'w=200,h=200,fit=cover':
          transformParams = '&f=auto&q=80';
          break;
        case 'format=webp':
          transformParams = '&f=auto&q=85';
          break;
        case 'format=webp,quality=85':
          transformParams = '&f=auto';
          break;
        default:
          transformParams = '&f=auto&fit=cover&w=300&h=300&q=80';  // 기본 썸네일용
      }
      
      return `https://imagedelivery.net${path}?exp=${exp}&sig=${sig}${transformParams}`;
    };
    
    return NextResponse.json({
      success: true,
      signedUrls: {
        originalUrl: generateSignedUrl('public'),
        webpUrl: generateSignedUrl('format=webp'),
        thumbnailUrl: generateSignedUrl('w=200,h=200,fit=cover'),
        variants: {
          small: generateSignedUrl('w=400'),
          medium: generateSignedUrl('w=800'),
          large: generateSignedUrl('w=1920'),
          webp: generateSignedUrl('format=webp,quality=85')
        }
      },
      expiresIn: 3600 // seconds
    });

  } catch (error) {
    console.error('Signed URL generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageId = searchParams.get('imageId');
  const variant = searchParams.get('variant') || 'public';
  
  if (!imageId) {
    return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
  }

  const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH || process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;

  if (!accountHash) {
    return NextResponse.json({ error: 'Account hash not configured' }, { status: 500 });
  }
  const urlSigningKey = process.env.CLOUDFLARE_IMAGES_SIGNING_KEY;
  
  if (!urlSigningKey) {
    return NextResponse.json({ error: 'Signing key not configured' }, { status: 500 });
  }
  
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const urlPath = `/${accountHash}/${imageId}/${variant}`;
  
  // For Cloudflare signed URLs, we need to sign only the path + exp, then add transform params
  const stringToSign = urlPath + '?exp=' + expiry;
  
  const signature = crypto
    .createHmac('sha256', urlSigningKey)
    .update(stringToSign)
    .digest('hex');
  
  // Add transform parameters after signing
  let transformParams = '';
  switch (variant) {
    case 'public':
      transformParams = '&f=auto&fit=contain&q=90';  // 상세보기용
      break;
    case 'reviewMedium':
      transformParams = '&f=auto';  // Public Gallery와 동일
      break;
    case 'standardThumbnail':
      transformParams = '&f=auto&fit=cover&w=300&h=300&q=80';  // 기본 썸네일용
      break;
    case 'w=400':
      transformParams = '&f=auto&fit=scale-down&q=85';
      break;
    case 'w=800':
      transformParams = '&f=auto&fit=scale-down&q=85';
      break;
    case 'w=1920':
      transformParams = '&f=auto&fit=scale-down&q=85';
      break;
    case 'w=200,h=200,fit=cover':
      transformParams = '&f=auto&q=80';
      break;
    case 'format=webp':
      transformParams = '&f=auto&q=85';
      break;
    case 'format=webp,quality=85':
      transformParams = '&f=auto';
      break;
    default:
      transformParams = '&f=auto&fit=cover&w=300&h=300&q=80';  // 기본 썸네일용
  }
    
  const signedUrl = `https://imagedelivery.net${urlPath}?exp=${expiry}&sig=${signature}${transformParams}`;
  
  return NextResponse.json({
    success: true,
    signedUrl,
    expiresIn: 3600
  });
}