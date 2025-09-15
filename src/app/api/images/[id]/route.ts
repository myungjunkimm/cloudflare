import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: imageId } = await params;
    
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error('Cloudflare credentials not configured');
    }

    // Cloudflare Images API를 통해 이미지 삭제
    // Bearer 토큰과 Global API Key 방식 모두 시도
    let response;
    
    try {
      // 먼저 Bearer 토큰 방식 시도
      response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          }
        }
      );
      
      // 인증 오류인 경우 Global API Key 방식으로 재시도
      if (response.status === 401 || response.status === 403) {
        console.log('Bearer token failed, trying Global API Key method...');
        response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
          {
            method: 'DELETE',
            headers: {
              'X-Auth-Key': CLOUDFLARE_API_TOKEN,
              'Content-Type': 'application/json',
            }
          }
        );
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    const responseText = await response.text();
    console.log(`Delete image ${imageId} - Status:`, response.status);
    console.log('Delete response:', responseText);

    if (!response.ok) {
      // 404는 이미 삭제된 것으로 간주
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          message: 'Image was already deleted or does not exist'
        });
      }
      throw new Error(`Cloudflare API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    
    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting image:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}