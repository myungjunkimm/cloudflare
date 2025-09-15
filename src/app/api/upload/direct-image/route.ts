import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;

    if (!apiKey || !accountId || !accountHash) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }

    // Get direct upload URL from Cloudflare
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requireSignedURLs: false,
          metadata: {}
        }),
      }
    );

    const result = await response.json();

    console.log('Cloudflare API Response:', {
      status: response.status,
      success: result.success,
      result: result,
      errors: result.errors
    });

    if (!result.success) {
      console.error('Cloudflare direct upload URL failed:', result);
      return NextResponse.json({ 
        error: 'Failed to get upload URL', 
        details: result,
        cloudflareErrors: result.errors 
      }, { status: 500 });
    }

    const uploadUrl = result.result.uploadURL;
    const imageId = result.result.id;
    const baseUrl = `https://imagedelivery.net/${accountHash}/${imageId}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      imageId,
      baseUrl,
      accountHash,
      urls: {
        originalUrl: `${baseUrl}/public?f=auto&q=90`,
        webpUrl: `${baseUrl}/format=webp&f=auto`,
        thumbnailUrl: `${baseUrl}/w=200,h=200,fit=cover&f=auto&q=80`,
        variants: {
          small: `${baseUrl}/w=400&f=auto&q=85`,
          medium: `${baseUrl}/w=800&f=auto&q=85`,
          large: `${baseUrl}/w=1920&f=auto&q=85`,
          webp: `${baseUrl}/format=webp,quality=85&f=auto`
        }
      }
    });

  } catch (error) {
    console.error('Direct upload URL error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}