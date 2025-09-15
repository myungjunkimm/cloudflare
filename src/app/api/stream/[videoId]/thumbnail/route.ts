import { NextRequest, NextResponse } from 'next/server';

// Set thumbnail timestamp for a video
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const body = await request.json();
    const { time = '2s' } = body; // Default to 2 seconds

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thumbnailTimestampPct: 0.1, // 10% into the video as a fallback
          // Or use specific time if needed
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to set thumbnail timestamp:', error);
      return NextResponse.json(
        { error: 'Failed to set thumbnail timestamp' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
      animatedThumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.gif`,
    });
  } catch (error) {
    console.error('Error setting thumbnail timestamp:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}