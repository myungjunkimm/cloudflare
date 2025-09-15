import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    console.log('Debug API called');

    if (!apiKey || !accountId) {
      return NextResponse.json({ 
        error: 'Missing API credentials',
        hasApiKey: !!apiKey,
        hasAccountId: !!accountId
      }, { status: 400 });
    }

    // Simple test - just get the list of videos
    console.log('Fetching videos list...');
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare API error:', response.status, errorText);
      return NextResponse.json({ 
        error: 'Cloudflare API error',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const result = await response.json();
    console.log('API response success:', result.success);

    if (!result.success) {
      console.error('Cloudflare API returned error:', result);
      return NextResponse.json({ 
        error: 'Cloudflare API returned error', 
        details: result 
      }, { status: 500 });
    }

    // Just return basic info for now
    const basicInfo = {
      success: true,
      totalVideos: result.result.length,
      firstVideo: result.result[0] ? {
        id: result.result[0].uid,
        status: result.result[0].status?.state,
        meta: result.result[0].meta,
        created: result.result[0].created
      } : null,
      accountInfo: {
        accountId,
        apiKeyPresent: !!apiKey
      }
    };

    console.log('Returning basic info:', basicInfo);
    return NextResponse.json(basicInfo);

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}