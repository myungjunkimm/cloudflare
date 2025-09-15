import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const apiKey = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;

    if (!apiKey || !accountId || !accountHash) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }

    if (!file || !apiKey || !accountId || !accountHash) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: cloudflareFormData,
      }
    );

    const result = await response.json();

    if (!result.success) {
      console.error('Cloudflare upload failed:', result);
      return NextResponse.json({ error: 'Upload failed', details: result }, { status: 500 });
    }

    const imageId = result.result.id;
    const baseUrl = `https://imagedelivery.net/${accountHash}/${imageId}`;

    return NextResponse.json({
      success: true,
      result: {
        id: imageId,
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
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}