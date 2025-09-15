'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Download, Trash2, Eye, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CloudflareImage {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
  meta?: Record<string, any>;
  displayURL: string;
  thumbnailURL: string;
  squareURL: string;
  signedURL?: string;
}

export default function SignedUrlGalleryPage() {
  const [images, setImages] = useState<CloudflareImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<CloudflareImage | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [refreshingUrls, setRefreshingUrls] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [perPage] = useState(48);

  useEffect(() => {
    fetchImages();
  }, [page]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/images/list?page=${page}&perPage=${perPage}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Filter only images that require signed URLs
        const signedImages = data.images.filter((img: CloudflareImage) => img.requireSignedURLs);
        
        // Generate signed URLs for each image
        const imagesWithSignedUrls = await Promise.all(
          signedImages.map(async (image: CloudflareImage) => {
            try {
              const signedUrlResponse = await fetch(`/api/images/signed-url?imageId=${image.id}&variant=public`);
              
              if (signedUrlResponse.ok) {
                const signedData = await signedUrlResponse.json();
                return {
                  ...image,
                  signedURL: signedData.signedUrl,
                  displayURL: signedData.signedUrl,
                  thumbnailURL: await generateSignedUrl(image.id, 'reviewMedium'),
                  squareURL: await generateSignedUrl(image.id, 'reviewMedium'),
                };
              } else {
                console.warn('Failed to generate signed URL for image:', image.id, 'Status:', signedUrlResponse.status);
              }
            } catch (e) {
              console.warn('Failed to generate signed URL for image:', image.id, e);
            }
            return image;
          })
        );
        
        setImages(imagesWithSignedUrls);
        setTotalImages(signedImages.length);
      } else {
        throw new Error(data.error || 'Failed to load images');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const generateSignedUrl = async (imageId: string, variant: string = 'reviewMedium'): Promise<string> => {
    try {
      const response = await fetch(`/api/images/signed-url?imageId=${imageId}&variant=${variant}`);
      if (response.ok) {
        const data = await response.json();
        return data.signedUrl;
      }
    } catch (e) {
      console.warn('Failed to generate signed URL for variant:', variant);
    }
    return '';
  };

  const refreshSignedUrl = async (imageId: string) => {
    setRefreshingUrls(prev => new Set(prev).add(imageId));
    
    try {
      const newSignedUrl = await generateSignedUrl(imageId, 'public');
      const newThumbnailUrl = await generateSignedUrl(imageId, 'reviewMedium');
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              signedURL: newSignedUrl,
              displayURL: newSignedUrl,
              thumbnailURL: newThumbnailUrl,
              squareURL: newThumbnailUrl
            }
          : img
      ));
    } catch (err) {
      console.error('Failed to refresh signed URL:', err);
    } finally {
      setRefreshingUrls(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('정말로 이 이미지를 삭제하시겠습니까?')) return;
    
    try {
      setDeletingImageId(imageId);
      
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      setTotalImages(prev => prev - 1);
      
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('이미지 삭제에 실패했습니다.');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleDownload = (image: CloudflareImage) => {
    if (image.signedURL || image.displayURL) {
      const link = document.createElement('a');
      link.href = image.signedURL || image.displayURL;
      link.download = image.filename || `signed-image-${image.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const totalPages = Math.ceil(totalImages / perPage);

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Signed URL 이미지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchImages}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Signed URL Gallery</h1>
        <p className="text-gray-600">
          서명된 URL이 필요한 이미지들 ({totalImages}개)
        </p>
        <p className="text-sm text-orange-600 mt-1">
          🔒 모든 이미지는 1시간 만료 시간의 서명된 URL로 보호됩니다
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">서명된 URL이 필요한 이미지가 없습니다.</p>
          <Button onClick={fetchImages}>새로고침</Button>
        </div>
      ) : (
        <>
          {/* Instagram-style Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square bg-gray-100 cursor-pointer group overflow-hidden"
                onClick={() => setSelectedImage(image)}
              >
                {image.thumbnailURL || image.squareURL ? (
                  <img
                    src={image.thumbnailURL || image.squareURL}
                    alt={image.filename || 'Image'}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-xs">Loading...</p>
                    </div>
                  </div>
                )}
                
                {/* Signed URL indicator */}
                <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                  🔒
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(image);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshSignedUrl(image.id);
                      }}
                      disabled={refreshingUrls.has(image.id)}
                    >
                      {refreshingUrls.has(image.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      disabled={deletingImageId === image.id}
                    >
                      {deletingImageId === image.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                이전
              </Button>
              <div className="flex items-center px-4">
                <span className="text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}

      {/* Image Detail Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              🔒 {selectedImage?.filename || `Signed Image ${selectedImage?.id}`}
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              {/* Full size image */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                {selectedImage.signedURL || selectedImage.displayURL ? (
                  <img
                    src={selectedImage.signedURL || selectedImage.displayURL}
                    alt={selectedImage.filename || 'Image'}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>서명된 URL 생성 중...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">이미지 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">파일명:</span>
                    <p className="font-medium">{selectedImage.filename || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">파일 타입:</span>
                    <p className="font-medium">
                      {(() => {
                        const ext = selectedImage.filename?.split('.').pop()?.toUpperCase();
                        return ext ? `${ext} Image` : 'Image';
                      })()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">업로드 날짜:</span>
                    <p className="font-medium">{new Date(selectedImage.uploaded).toLocaleString('ko-KR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Signed URL 필요:</span>
                    <p className="font-medium text-orange-600">
                      🔒 예 (서명된 URL 필요)
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block mb-1">이미지 ID:</span>
                    <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">{selectedImage.id}</p>
                  </div>
                  {selectedImage.variants && selectedImage.variants.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-500 block mb-1">사용 가능한 Variants:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedImage.variants.map((variant: string) => (
                          <span key={variant} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {variant}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedImage.meta && Object.keys(selectedImage.meta).length > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-500 block mb-1">메타데이터:</span>
                      <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(selectedImage.meta, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => refreshSignedUrl(selectedImage.id)}
                  disabled={refreshingUrls.has(selectedImage.id)}
                >
                  {refreshingUrls.has(selectedImage.id) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      URL 갱신 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      URL 갱신
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedImage)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  다운로드
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedImage.id)}
                  disabled={deletingImageId === selectedImage.id}
                >
                  {deletingImageId === selectedImage.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}