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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // First get the one-time upload URL
    const uploadUrlResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
          requireSignedURLs: true,
          allowedOrigins: ["*"],
          metadata: {
            source: 'web-upload',
            timestamp: new Date().toISOString(),
            requiresSignedUrl: 'true'
          }
        }),
      }
    );

    const uploadUrlResult = await uploadUrlResponse.json();

    if (!uploadUrlResult.success) {
      console.error('Failed to get upload URL:', uploadUrlResult);
      return NextResponse.json({ 
        error: 'Failed to get upload URL', 
        details: uploadUrlResult,
        cloudflareErrors: uploadUrlResult.errors 
      }, { status: 500 });
    }

    // Upload the file to the one-time URL
    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', file);

    const uploadResponse = await fetch(uploadUrlResult.result.uploadURL, {
      method: 'POST',
      body: cloudflareFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload to Cloudflare failed:', errorText);
      return NextResponse.json({ 
        error: 'Upload failed', 
        details: errorText 
      }, { status: 500 });
    }

    const videoId = uploadUrlResult.result.uid;

    return NextResponse.json({
      success: true,
      result: {
        id: videoId,
        streamUrl: `https://customer-${accountHash}.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
        thumbnailUrl: `https://customer-${accountHash}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`,
        animatedThumbnailUrl: `https://customer-${accountHash}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.gif`,
        iframeUrl: `https://customer-${accountHash}.cloudflarestream.com/${videoId}/iframe`,
        playbackUrl: `https://customer-${accountHash}.cloudflarestream.com/${videoId}/watch`,
        requiresSignedUrl: true
      }
    });

  } catch (error) {
    console.error('Signed video upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}