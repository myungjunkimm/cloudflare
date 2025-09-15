import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('🔄 Update signed URL API called');
    
    const body = await request.json();
    const { imageId } = body;
    
    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }
    
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }
    
    // Try different approaches to update image to require signed URLs
    
    // Method 1: Try v2 API first
    let url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v2/${imageId}`;
    console.log('🌐 Update URL (v2):', url);
    
    let response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requireSignedURLs: true
      })
    });

    let responseText = await response.text();
    console.log('📡 v2 Update response status:', response.status);
    console.log('📄 v2 Update response body:', responseText);

    // If v2 fails, try v1
    if (!response.ok) {
      console.log('🔄 v2 failed, trying v1 API...');
      
      url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`;
      console.log('🌐 Update URL (v1):', url);
      
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requireSignedURLs: true,
          metadata: {
            updatedToSigned: new Date().toISOString(),
            signedURLRequired: 'true'
          }
        })
      });

      responseText = await response.text();
      console.log('📡 v1 Update response status:', response.status);
      console.log('📄 v1 Update response body:', responseText);
    }

    if (!response.ok) {
      console.error('❌ Failed to update image to signed URLs');
      // 업데이트 실패해도 업로드는 성공했으므로 에러로 처리하지 않음
      return NextResponse.json({
        success: false,
        message: 'Image uploaded but failed to set signed URL requirement',
        details: responseText
      });
    }

    const data = JSON.parse(responseText);
    
    console.log('✅ Image updated to require signed URLs');
    
    return NextResponse.json({
      success: true,
      requireSignedURLs: true,
      message: 'Image updated to require signed URLs'
    });
    
  } catch (error) {
    console.error('💥 Error updating image signed URL setting:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update signed URL setting',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}