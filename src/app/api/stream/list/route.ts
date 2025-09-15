import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!apiKey || !accountId) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }

    if (!apiKey || !accountId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const result = await response.json();

    if (!result.success) {
      console.error('Cloudflare Stream list failed:', result);
      return NextResponse.json({ error: 'Failed to list videos', details: result }, { status: 500 });
    }

    console.log('API call successful, processing videos...');

    const videos = result.result.map((video: any) => {
      console.log('Processing video:', {
        uid: video.uid,
        status: video.status,
        thumbnail: video.thumbnail,
        preview: video.preview,
        playback: video.playback,
        meta: video.meta
      });
      
      return {
        id: video.uid,
        status: video.status?.state || 'unknown',
        pctComplete: video.status?.pctComplete || 0,
        meta: {
          name: video.meta?.name || video.input?.name || '',
          created: video.created,
          modified: video.modified,
          size: video.size,
          duration: video.duration
        },
        urls: {
          streamUrl: `https://videodelivery.net/${video.uid}/downloads/default.mp4`,
          hlsUrl: `https://videodelivery.net/${video.uid}/manifest/video.m3u8`,
          dashUrl: `https://videodelivery.net/${video.uid}/manifest/video.mpd`,
          // Use actual thumbnail URLs from Cloudflare response if available
          thumbnailUrl: video.thumbnail || `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg`,
          animatedThumbnailUrl: `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.gif`,
          iframeUrl: `https://iframe.videodelivery.net/${video.uid}`,
          // Additional thumbnail options
          thumbnailWebP: `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.webp`,
          preview: video.preview || `https://videodelivery.net/${video.uid}/previews/preview.webp`,
          // Test if these are the correct patterns
          directThumbnail: `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=1s`,
          directGif: `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.gif?time=1s&duration=3s`
        }
      };
    });

    return NextResponse.json({
      success: true,
      result: videos
    });

  } catch (error) {
    console.error('List videos error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}