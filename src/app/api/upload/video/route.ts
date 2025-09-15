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
  
  

    if (!file || !apiKey || !accountId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
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
      console.error('Cloudflare Stream upload failed:', result);
      return NextResponse.json({ error: 'Upload failed', details: result }, { status: 500 });
    }

    const videoId = result.result.uid;

    return NextResponse.json({
      success: true,
      result: {
        id: videoId,
        streamUrl: `https://videodelivery.net/${videoId}/downloads/default.mp4`,
        hlsUrl: `https://videodelivery.net/${videoId}/manifest/video.m3u8`,
        dashUrl: `https://videodelivery.net/${videoId}/manifest/video.mpd`,
        thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
        animatedThumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.gif`
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}