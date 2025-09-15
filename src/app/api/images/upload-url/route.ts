import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Cloudflare Images Direct Creator Upload 방식
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    
    console.log('Cloudflare Account ID:', CLOUDFLARE_ACCOUNT_ID ? 'Set' : 'Not set');
    console.log('Cloudflare API Token:', CLOUDFLARE_API_TOKEN ? 'Set' : 'Not set');
    
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error('Cloudflare credentials not configured');
    }
    
    // Cloudflare Images API 엔드포인트 - Direct Creator Upload
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/direct_upload`;
    console.log('Requesting URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      }
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    
    if (!data.success) {
      throw new Error(`Cloudflare API returned error: ${JSON.stringify(data.errors)}`);
    }
    
    // uploadURL과 id를 클라이언트에 반환
    return NextResponse.json({
      success: true,
      uploadURL: data.result.uploadURL,
      id: data.result.id
    });
    
  } catch (error) {
    console.error('Error getting upload URL:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}