import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const apiKey = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!apiKey || !accountId) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }

    if (!videoId || !apiKey || !accountId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const result = await response.json();

    if (!result.success) {
      console.error('Cloudflare Stream status check failed:', result);
      return NextResponse.json({ error: 'Status check failed', details: result }, { status: 500 });
    }

    const video = result.result;
    
    return NextResponse.json({
      success: true,
      result: {
        id: video.uid,
        status: {
          state: video.status?.state || 'unknown',
          pctComplete: video.status?.pctComplete || 0,
          errorReasonText: video.status?.errorReasonText || null
        },
        playback: video.playback || {},
        preview: video.preview || video.thumbnail || {},
        meta: {
          name: video.meta?.name || '',
          created: video.created,
          modified: video.modified,
          size: video.size,
          duration: video.duration
        },
        urls: {
          streamUrl: `https://videodelivery.net/${video.uid}/downloads/default.mp4`,
          hlsUrl: `https://videodelivery.net/${video.uid}/manifest/video.m3u8`,
          dashUrl: `https://videodelivery.net/${video.uid}/manifest/video.mpd`,
          thumbnailUrl: `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg`,
          animatedThumbnailUrl: `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.gif`
        }
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}