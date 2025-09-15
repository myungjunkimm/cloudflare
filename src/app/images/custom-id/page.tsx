'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { imageStorage, ImageData } from '@/lib/imageStorage';
import { X, Image as ImageIcon, Loader2, Check, Upload } from 'lucide-react';
import { createImageThumbnail } from '@/lib/thumbnailUtils.js';
import { readFileAsDataURL } from '@/lib/fileReader.js';

interface UploadedFile {
  id: string;
  file: File; // 원본 파일 객체 저장
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'failed'; // pending 상태 추가
  progress: number;
  imageURL?: string;
  thumbnailURL?: string;
  clientThumbnail?: string; // 로컬에서 생성한 썸네일
  fileSize?: number;
  imageInfo?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

export default function CustomIdUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [savedImages, setSavedImages] = useState<ImageData[]>([]);
  const [customId, setCustomId] = useState('');

  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = () => {
    setSavedImages(imageStorage.getAll());
  };

  // FileReader로 이미지 정보 추출
  const getImageInfo = (file: File): Promise<{width: number, height: number, aspectRatio: number}> => {
    return new Promise((resolve, reject) => {
      readFileAsDataURL(file)
        .then(dataURL => {
          const img = new Image();
          img.onload = () => {
            resolve({
              width: img.width,
              height: img.height,
              aspectRatio: img.width / img.height
            });
          };
          img.onerror = () => reject(new Error('이미지 로드 실패'));
          img.src = dataURL;
        })
        .catch(reject);
    });
  };

  // 파일 선택 시 썸네일 생성 후 바로 업로드
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 여러 파일을 병렬로 처리 (썸네일 생성 + 업로드)
    const uploadPromises = Array.from(files).map(file => prepareAndUploadFile(file));
    await Promise.all(uploadPromises);

    // 입력 초기화
    e.target.value = '';
  };

  // 파일 선택 시 썸네일 생성 후 바로 업로드
  const prepareAndUploadFile = async (file: File) => {
    // 임시 ID 생성
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 이미지가 아닌 파일은 처리하지 않음
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      // 1. 즉시 Blob URL 생성 (동기적, 매우 빠름)
      const blobURL = URL.createObjectURL(file);
      
      // 2. 썸네일과 함께 즉시 UI에 추가
      const uploadingFile: UploadedFile = {
        id: tempId,
        file: file, // 원본 파일 저장
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        status: 'uploading', // 바로 업로드 상태
        progress: 0,
        fileSize: file.size,
        clientThumbnail: blobURL, // 즉시 썸네일 포함
      };

      setUploadedFiles(prev => [...prev, uploadingFile]);
      console.log('File item with immediate thumbnail added for:', tempId);
      
      // 3. 백그라운드에서 최적화된 썸네일 생성 및 이미지 정보 추출
      Promise.all([
        createImageThumbnail(file, { 
          maxWidth: 150, 
          maxHeight: 150, 
          quality: 0.8 
        }),
        getImageInfo(file)
      ]).then(([optimizedThumbnailDataURL, imageInfo]) => {
        console.log('Generated optimized thumbnail:', {
          fileName: file.name,
          dimensions: `${imageInfo.width}x${imageInfo.height}`,
          aspectRatio: imageInfo.aspectRatio.toFixed(2)
        });
        
        // 최적화된 썸네일로 업데이트
        setUploadedFiles(prev => {
          const updated = prev.map(f => 
            f.id === tempId 
              ? { 
                  ...f, 
                  clientThumbnail: optimizedThumbnailDataURL,
                  imageInfo
                }
              : f
          );
          console.log('Updated file with optimized thumbnail:', updated.find(f => f.id === tempId));
          return updated;
        });
      }).catch(error => {
        console.warn('Failed to generate optimized thumbnail, using original:', error);
      });
      
      // 4. 업로드 시작 (비동기)
      uploadFile(uploadingFile).catch(error => {
        console.error('Upload failed:', error);
        // 업로드 실패 시 상태 업데이트
        setUploadedFiles(prev => prev.map(f => 
          f.id === tempId ? { ...f, status: 'failed' as const, progress: 0 } : f
        ));
      });
      
    } catch (error) {
      console.error('Failed to prepare and upload file:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  // 실제 Cloudflare 업로드 수행
  const uploadFile = async (fileData: UploadedFile) => {
    const { id: tempId, file } = fileData;
    
    try {
      // 상태를 uploading으로 변경
      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId ? { ...f, status: 'uploading' as const } : f
      ));

      updateProgress(tempId, 10);

      // 1. uploadURL 가져오기
      const response = await fetch('/api/images/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customId: customId || undefined })
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL, id } = await response.json();
      updateProgress(tempId, 40);

      // 2. 파일 업로드
      const formData = new FormData();
      formData.append('file', file);
      
      updateProgress(tempId, 60);

      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: formData
      });

      updateProgress(tempId, 80);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      // 업로드 결과 확인
      const uploadResult = await uploadResponse.json();
      console.log('Upload successful:', uploadResult);
      
      updateProgress(tempId, 90);

      // 3. 업로드된 이미지의 실제 ID는 응답에서 가져와야 함
      const actualImageId = uploadResult.result.id;
      console.log(`Using actual Cloudflare image ID: ${actualImageId}`);
      
      const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'ydJcczaKlrbCH-7R2wtX_w';
      const baseURL = `https://imagedelivery.net/${accountHash}/${actualImageId}`;
      
      updateProgress(tempId, 100);

      // 업로드 완료 상태 업데이트 - 실제 Cloudflare ID로 변경
      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId 
          ? { 
              ...f,
              id: actualImageId, // 실제 저장된 ID 사용
              status: 'uploaded' as const, 
              progress: 100,
              imageURL: `${baseURL}/public`,
              thumbnailURL: `${baseURL}/thumbnail`
            }
          : f
      ));

    } catch (error) {
      console.error('Upload error:', error);
      
      // 에러 상태 업데이트
      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId 
          ? { ...f, status: 'failed' as const, progress: 0 }
          : f
      ));
    }
  };

  const updateProgress = (fileId: string, progress: number) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, progress } : f
    ));
  };

  const removeFile = async (fileId: string) => {
    console.log('🗑️ Removing file with ID:', fileId);
    console.log('📋 Current files before removal:', uploadedFiles.map(f => f.id));
    
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) {
      console.warn('❌ File not found:', fileId);
      return;
    }

    console.log('✅ Found file to remove:', file.fileName);

    // Blob URL 메모리 해제
    if (file.clientThumbnail && file.clientThumbnail.startsWith('blob:')) {
      URL.revokeObjectURL(file.clientThumbnail);
    }

    // 먼저 로컬 목록에서 제거 (즉시 반응)
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.id !== fileId);
      console.log('📋 Files after removal:', filtered.map(f => f.id));
      return filtered;
    });

    // 업로드된 파일의 경우에만 Cloudflare에서 삭제 시도
    if (file.status === 'uploaded') {
      // 백그라운드에서 Cloudflare 삭제 시도
      deleteFromCloudflare(fileId);
    } else {
      console.log(`Removing ${file.status} file from local list only`);
    }
  };

  const deleteFromCloudflare = async (imageId: string) => {
    try {
      console.log(`🗑️ Deleting image ${imageId} from Cloudflare...`);
      
      const deleteResponse = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        const result = await deleteResponse.json();
        console.log(`✅ Image ${imageId} successfully deleted from Cloudflare:`, result);
      } else {
        const errorText = await deleteResponse.text();
        console.error(`❌ Failed to delete image ${imageId} from Cloudflare (${deleteResponse.status}):`, errorText);
      }
    } catch (error) {
      console.error(`❌ Error deleting image ${imageId} from Cloudflare:`, error);
    }
  };

  const handleSubmit = async () => {
    // 업로드된 파일들을 localStorage에 저장
    const successfulUploads = uploadedFiles.filter(f => f.status === 'uploaded');
    
    if (successfulUploads.length > 0) {
      successfulUploads.forEach(file => {
        const imageData: ImageData = {
          id: file.id,
          uploadURL: '', // 이미 업로드됨
          uploadedAt: file.uploadedAt,
          fileName: file.fileName,
          status: 'uploaded',
          imageURL: file.imageURL,
          thumbnailURL: file.thumbnailURL
        };
        imageStorage.add(imageData);
      });

      // 상태 초기화
      setUploadedFiles([]);
      loadSavedImages();
      
      alert(`${successfulUploads.length}개의 이미지가 저장되었습니다!`);
    } else {
      alert('저장할 이미지가 없습니다.');
    }
  };

  const hasPendingFiles = uploadedFiles.some(f => f.status === 'pending');
  const hasUploadedFiles = uploadedFiles.some(f => f.status === 'uploaded');
  const isUploading = uploadedFiles.some(f => f.status === 'uploading');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Custom ID Upload - Instant Upload</h1>
      
      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>파일 선택 즉시 자동 업로드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="custom-id" className="text-sm font-medium mb-1 block">
                  커스텀 ID (선택사항)
                </label>
                <Input
                  id="custom-id"
                  type="text"
                  placeholder="예: product-image-001"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  비워두면 자동으로 ID가 생성됩니다
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  파일 선택 (자동 업로드)
                </label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  파일 선택 시 즉시 업로드가 시작됩니다.
                </p>
              </div>
            </div>

            {/* 업로드 중인 파일 목록 */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">파일 목록</h4>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    {/* 로컬 썸네일 또는 기본 아이콘 */}
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden relative">
                      {/* 로컬 썸네일 (최우선) */}
                      {file.clientThumbnail && (
                        <img 
                          src={file.clientThumbnail} 
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* 기본 아이콘 (썸네일 없을 때) */}
                      {!file.clientThumbnail && (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                      
                    </div>

                    {/* 파일 정보 및 진행률 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate pr-2">{file.fileName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                          {file.imageInfo && (
                            <span>{file.imageInfo.width}×{file.imageInfo.height}</span>
                          )}
                          {file.fileSize && (
                            <span>{(file.fileSize / 1024 / 1024).toFixed(1)}MB</span>
                          )}
                        </div>
                      </div>
                      
                      {file.status === 'uploading' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">업로드 중...</span>
                            <span className="text-xs font-medium text-blue-600">{file.progress}%</span>
                          </div>
                          <Progress value={file.progress} className="h-1.5" />
                        </div>
                      )}
                      
                      {file.status === 'uploaded' && (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">업로드 완료</span>
                        </div>
                      )}
                      
                      {file.status === 'failed' && (
                        <span className="text-xs text-red-500">업로드 실패</span>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔴 X Button clicked for file:', file.id, 'fileName:', file.fileName);
                        console.log('🔴 All files at click time:', uploadedFiles.map(f => ({id: f.id, name: f.fileName})));
                        removeFile(file.id);
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit}
                disabled={(!hasPendingFiles && !hasUploadedFiles) || isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업로드 중...
                  </>
                ) : hasUploadedFiles ? (
                  `저장하기 (${uploadedFiles.filter(f => f.status === 'uploaded').length})`
                ) : (
                  '파일을 선택하세요'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Info Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instant Upload</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 파일 선택 시 로컬 썸네일 즉시 생성</li>
          <li>• 썸네일 표시와 동시에 Cloudflare 업로드 시작</li>
          <li>• 업로드 진행률 실시간 표시</li>
          <li>• 커스텀 ID 지정 가능</li>
          <li>• 다중 파일 동시 처리 지원</li>
        </ul>
      </div>
    </div>
  );
}