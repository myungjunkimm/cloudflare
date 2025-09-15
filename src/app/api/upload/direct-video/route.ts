import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!apiKey || !accountId) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }

    // Get direct upload URL from Cloudflare Stream
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600, // 1 hour max
        }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      console.error('Cloudflare Stream direct upload URL failed:', result);
      return NextResponse.json({ error: 'Failed to get upload URL', details: result }, { status: 500 });
    }

    const uploadUrl = result.result.uploadURL;
    const videoId = result.result.uid;

    return NextResponse.json({
      success: true,
      uploadUrl,
      videoId,
      urls: {
        streamUrl: `https://videodelivery.net/${videoId}/manifest/video.m3u8`,
        thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
        animatedThumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.gif`
      }
    });

  } catch (error) {
    console.error('Direct upload URL error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}