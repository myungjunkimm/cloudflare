import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('🔵 Direct signed upload API called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customId = formData.get('customId') as string;
    const metadata = formData.get('metadata') as string;
    
    console.log('📦 Form data received:', {
      fileName: file?.name,
      fileSize: file?.size,
      customId: customId || 'auto-generated',
      hasMetadata: !!metadata
    });
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.error('❌ Missing Cloudflare credentials');
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }
    
    // Direct upload to Cloudflare with requireSignedURLs
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;
    console.log('🌐 Direct upload URL:', url);
    
    // Create FormData for Cloudflare API
    const cloudflareFormData = new FormData();
    cloudflareFormData.append('file', file);
    cloudflareFormData.append('requireSignedURLs', 'true');
    
    if (customId) {
      cloudflareFormData.append('id', customId);
    }
    
    if (metadata) {
      const parsedMetadata = JSON.parse(metadata);
      cloudflareFormData.append('metadata', JSON.stringify({
        ...parsedMetadata,
        uploadedFrom: 'signed-url-page',
        requiresSignedAccess: 'true'
      }));
    } else {
      cloudflareFormData.append('metadata', JSON.stringify({
        uploadedFrom: 'signed-url-page',
        requiresSignedAccess: 'true'
      }));
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: cloudflareFormData
    });

    const responseText = await response.text();
    console.log('📡 Direct upload response status:', response.status);
    console.log('📄 Direct upload response body:', responseText);

    if (!response.ok) {
      console.error('❌ Cloudflare direct upload error:', response.status, responseText);
      return NextResponse.json(
        { error: `Cloudflare upload error: ${response.status}`, details: responseText },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    
    if (!data.success) {
      console.error('❌ Cloudflare API returned error:', data.errors);
      return NextResponse.json(
        { error: 'Cloudflare API returned error', details: data.errors },
        { status: 400 }
      );
    }
    
    console.log('✅ Image uploaded directly with signed URLs required');
    
    return NextResponse.json({
      success: true,
      result: data.result,
      requireSignedURLs: true
    });
    
  } catch (error) {
    console.error('💥 Unexpected error in direct signed upload API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}