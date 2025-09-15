import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { videoId } = await request.json();
    
    console.log('Delete video request received:', { videoId });
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    const apiKey = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!apiKey || !accountId) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }

    const deleteUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`;
    console.log('Attempting to delete video:', { deleteUrl, videoId, accountId });

    // Delete video from Cloudflare Stream
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Cloudflare Stream Delete Response Status:', response.status);

    // Check if response has content before parsing JSON
    let result = null;
    try {
      const text = await response.text();
      if (text.trim()) {
        result = JSON.parse(text);
      }
    } catch (parseError) {
      console.log('No JSON response body, checking status code');
    }

    // For DELETE requests, 200-299 status codes indicate success
    if (!response.ok) {
      console.error('Cloudflare stream delete failed:', { 
        status: response.status, 
        result 
      });
      return NextResponse.json({ 
        error: 'Delete failed', 
        status: response.status,
        details: result 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Video delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}