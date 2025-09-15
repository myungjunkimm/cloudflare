'use client';

import React, { useState, useEffect } from 'react';
import { MediaItem } from '@/types/review';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SignedImage } from '@/lib/cloudflare-signed';

interface SignedMediaViewerProps {
  items: MediaItem[];
}

export default function SignedMediaViewer({ items }: SignedMediaViewerProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate signed URL when an item is selected
  const handleViewItem = async (item: MediaItem) => {
    setSelectedItem(item);
    
    if (item.requiresSignedUrl && item.type === 'image') {
      setLoading(true);
      try {
        const response = await fetch('/api/images/signed-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageId: item.cloudflareId,
            variant: 'public' 
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          setSignedUrl(result.signedUrls.originalUrl);
        }
      } catch (error) {
        console.error('Failed to get signed URL:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-medium mb-4">Uploaded Media</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div key={index} className="space-y-2">
              <Card 
                className="p-2 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleViewItem(item)}
              >
                <div className="aspect-square rounded overflow-hidden bg-gray-100">
                  {item.type === 'image' ? (
                    item.requiresSignedUrl ? (
                      <SignedImage
                        src={item.thumbnailUrl || ''}
                        imageId={item.cloudflareId}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                        variant="thumbnail"
                      />
                    ) : (
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <span className="text-white text-xs">Video</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium truncate">{item.fileName}</p>
                  <div className="flex gap-1">
                    {item.isRepresentative && (
                      <Badge variant="secondary" className="text-xs">대표</Badge>
                    )}
                    {item.requiresSignedUrl && (
                      <Badge variant="outline" className="text-xs">Signed</Badge>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Card>

      {selectedItem && (
        <Card className="p-4">
          <h3 className="font-medium mb-4">Selected: {selectedItem.fileName}</h3>
          
          {loading ? (
            <div className="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-500">Loading signed content...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedItem.type === 'image' && (
                <>
                  {selectedItem.requiresSignedUrl ? (
                    <>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          This image requires a signed URL for viewing. The signed URL expires after 1 hour.
                        </p>
                      </div>
                      {signedUrl && (
                        <img 
                          src={signedUrl} 
                          alt={selectedItem.fileName}
                          className="max-w-full rounded"
                        />
                      )}
                    </>
                  ) : (
                    <img 
                      src={selectedItem.originalUrl} 
                      alt={selectedItem.fileName}
                      className="max-w-full rounded"
                    />
                  )}
                </>
              )}
              
              {selectedItem.type === 'video' && (
                <video 
                  src={selectedItem.streamUrl} 
                  controls 
                  className="max-w-full rounded"
                />
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span>{selectedItem.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cloudflare ID:</span>
                  <span className="font-mono text-xs">{selectedItem.cloudflareId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requires Signed URL:</span>
                  <span>{selectedItem.requiresSignedUrl ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="p-4 bg-gray-50">
        <h4 className="font-medium mb-2">How to Use Signed URLs</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. When uploading with "Signed URL Upload" method, the content requires authentication to view.</p>
          <p>2. To display signed content, use the SignedImage component or fetch a signed URL from the API.</p>
          <p>3. Signed URLs expire after 1 hour for security.</p>
          <p>4. Example code:</p>
          <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
{`// Using SignedImage component
<SignedImage 
  src={item.thumbnailUrl}
  imageId={item.cloudflareId}
  alt="Description"
  variant="thumbnail"
/>

// Or fetch signed URL directly
const response = await fetch('/api/images/signed-url', {
  method: 'POST',
  body: JSON.stringify({ imageId })
});`}
          </pre>
        </div>
      </Card>
    </div>
  );
}