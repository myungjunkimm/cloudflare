import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'jpg';
    
    console.log(`Thumbnail request for video ${videoId}, type: ${type}`);
    
    // First check if the video allows public thumbnails
    const publicUrls = [
      `https://iframe.videodelivery.net/${videoId}/thumbnail.${type}`,
      `https://videodelivery.net/${videoId}/thumbnails/thumbnail.${type}`,
    ];

    // Try public URLs first
    for (const url of publicUrls) {
      try {
        console.log(`Trying public URL: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.arrayBuffer();
          const contentType = type === 'gif' ? 'image/gif' : 
                             type === 'webp' ? 'image/webp' : 'image/jpeg';
          
          console.log(`✅ Public thumbnail found: ${url}`);
          return new NextResponse(data, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      } catch (error) {
        console.log(`❌ Public URL failed: ${url}`, error);
        continue;
      }
    }

    // If public URLs don't work, try API approach
    const apiKey = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!apiKey || !accountId) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }

    // Get video info first to check if thumbnails are available
    const videoInfoUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`;
    console.log(`Getting video info: ${videoInfoUrl}`);
    
    const videoResponse = await fetch(videoInfoUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!videoResponse.ok) {
      return NextResponse.json({ 
        error: 'Video not found or not accessible',
        videoId,
        status: videoResponse.status 
      }, { status: 404 });
    }

    const videoData = await videoResponse.json();
    console.log('Video data:', JSON.stringify(videoData, null, 2));

    // Return info about what we found
    return NextResponse.json({
      error: 'No public thumbnails available',
      videoId,
      videoStatus: videoData.result?.status?.state,
      thumbnailsChecked: publicUrls,
      suggestion: 'Video might be private or thumbnails not yet generated'
    }, { status: 404 });

  } catch (error) {
    console.error('Thumbnail proxy error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}