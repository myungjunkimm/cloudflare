'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MediaItem, UploadProgress } from '@/types/review';
import { uploadToCloudflareImages, uploadToCloudflareStream } from '@/lib/cloudflare';

interface FileUploadProps {
  onFilesUploaded: (files: MediaItem[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

type UploadMethod = 'server' | 'direct' | 'signed';

export default function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 5, 
  maxSize = 200 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MediaItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('signed');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = (file: File) => file.type.startsWith('image/');
  const isVideo = (file: File) => file.type.startsWith('video/');

  const uploadImageDirect = async (file: File) => {
    // Get upload URL
    const urlResponse = await fetch('/api/upload/direct-image', { method: 'POST' });
    const urlResult = await urlResponse.json();
    
    console.log('Direct upload URL response:', urlResult);
    
    if (!urlResult.success) {
      console.error('Failed to get upload URL:', urlResult);
      throw new Error(`Failed to get upload URL: ${JSON.stringify(urlResult.cloudflareErrors || urlResult.error)}`);
    }

    // Upload file directly to Cloudflare
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch(urlResult.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const uploadResult = await uploadResponse.text();
    
    if (!uploadResponse.ok) {
      console.error('Direct upload failed:', uploadResult);
      throw new Error(`Direct upload failed: ${uploadResult}`);
    }

    // Parse the result if it's JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(uploadResult);
    } catch {
      parsedResult = uploadResult;
    }

    console.log('Upload successful:', parsedResult);

    return {
      id: urlResult.imageId,
      ...urlResult.urls
    };
  };

  const uploadImageSigned = async (file: File) => {
    // Upload file to our API which will handle signed URL requirements
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload/signed-image', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    console.log('Signed upload response:', result);
    
    if (!result.success) {
      console.error('Failed to upload with signed URL:', result);
      throw new Error(`Failed to upload: ${JSON.stringify(result.cloudflareErrors || result.error)}`);
    }

    return result.result;
  };

  const uploadVideoDirect = async (file: File) => {
    // Get upload URL
    const urlResponse = await fetch('/api/upload/direct-video', { method: 'POST' });
    const urlResult = await urlResponse.json();
    
    console.log('Direct video upload URL response:', urlResult);
    
    if (!urlResult.success) {
      console.error('Failed to get video upload URL:', urlResult);
      throw new Error(`Failed to get upload URL: ${JSON.stringify(urlResult.cloudflareErrors || urlResult.error)}`);
    }

    // Upload file directly to Cloudflare
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch(urlResult.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Direct upload failed');
    }

    return {
      id: urlResult.videoId,
      ...urlResult.urls
    };
  };

  const uploadVideoSigned = async (file: File) => {
    // Upload file to our API which will handle signed URL requirements
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload/signed-video', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    console.log('Signed video upload response:', result);
    
    if (!result.success) {
      console.error('Failed to upload video with signed URL:', result);
      throw new Error(`Failed to upload: ${JSON.stringify(result.cloudflareErrors || result.error)}`);
    }

    return result.result;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!isImage(file) && !isVideo(file)) {
        alert(`${file.name}은(는) 지원되지 않는 파일 형식입니다.`);
        return false;
      }
      if (file.size > maxSize * 1024 * 1024) {
        alert(`${file.name}이(가) 최대 크기(${maxSize}MB)를 초과합니다.`);
        return false;
      }
      return true;
    });

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    for (const file of validFiles) {
      const progressKey = file.name + Date.now();
      
      setUploadProgress(prev => ({
        ...prev,
        [progressKey]: {
          fileName: file.name,
          progress: 50,
          status: 'uploading'
        }
      }));

      try {
        let mediaItem: MediaItem;
        
        if (isImage(file)) {
          const result = uploadMethod === 'direct' 
            ? await uploadImageDirect(file)
            : uploadMethod === 'signed'
            ? await uploadImageSigned(file)
            : await uploadToCloudflareImages(file);
          
          mediaItem = {
            type: 'image',
            fileName: file.name,
            cloudflareId: result.id,
            originalUrl: result.originalUrl,
            webpUrl: result.webpUrl,
            thumbnailUrl: result.thumbnailUrl,
            variants: result.variants,
            isRepresentative: uploadedFiles.length === 0,
            requiresSignedUrl: uploadMethod === 'signed'
          };
        } else {
          const result = uploadMethod === 'direct'
            ? await uploadVideoDirect(file)
            : uploadMethod === 'signed'
            ? await uploadVideoSigned(file)
            : await uploadToCloudflareStream(file);
          
          mediaItem = {
            type: 'video',
            fileName: file.name,
            cloudflareId: result.id,
            streamUrl: result.streamUrl,
            hlsUrl: result.hlsUrl,
            dashUrl: result.dashUrl,
            thumbnailUrl: result.thumbnailUrl,
            animatedThumbnailUrl: result.animatedThumbnailUrl,
            isRepresentative: uploadedFiles.length === 0,
            requiresSignedUrl: uploadMethod === 'signed'
          };
        }

        setUploadedFiles(prev => [...prev, mediaItem]);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[progressKey];
          return newProgress;
        });

      } catch (error) {
        console.error('Upload failed:', error);
        setUploadProgress(prev => ({
          ...prev,
          [progressKey]: {
            ...prev[progressKey],
            status: 'error'
          }
        }));
        
        alert(`${file.name} 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    }
  };

  React.useEffect(() => {
    onFilesUploaded(uploadedFiles);
  }, [uploadedFiles, onFilesUploaded]);

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    
    if (uploadedFiles[index].isRepresentative && newFiles.length > 0) {
      newFiles[0].isRepresentative = true;
    }
    
    setUploadedFiles(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Method Selection */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="font-medium text-sm">업로드 방식 선택</div>
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="uploadMethod"
                value="direct"
                checked={uploadMethod === 'direct'}
                onChange={(e) => setUploadMethod(e.target.value as UploadMethod)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm">
                <span className="font-medium">Direct Upload</span>
                <span className="text-gray-500 block text-xs">빠른 업로드 (권장)</span>
              </span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="uploadMethod"
                value="signed"
                checked={uploadMethod === 'signed'}
                onChange={(e) => setUploadMethod(e.target.value as UploadMethod)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm">
                <span className="font-medium">Signed URL Upload</span>
                <span className="text-gray-500 block text-xs">보안 서명 URL (권장)</span>
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="uploadMethod"
                value="server"
                checked={uploadMethod === 'server'}
                onChange={(e) => setUploadMethod(e.target.value as UploadMethod)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm">
                <span className="font-medium">Server Upload</span>
                <span className="text-gray-500 block text-xs">서버 경유 업로드</span>
              </span>
            </label>
          </div>
        </div>
      </Card>

      <Card
        className={`p-6 border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center">
          <div className="text-lg font-medium mb-2">파일 업로드</div>
          <div className="text-sm text-gray-500 mb-2">
            클릭하거나 파일을 드래그하여 업로드하세요
          </div>
          <div className="text-xs text-primary font-medium mb-2">
            현재 방식: {uploadMethod === 'direct' ? 'Direct Upload (빠름)' : uploadMethod === 'signed' ? 'Signed URL Upload (보안)' : 'Server Upload (안정)'}
          </div>
          <div className="text-xs text-gray-400">
            최대 {maxFiles}개 파일, 각 파일당 최대 {maxSize}MB
          </div>
          <div className="text-xs text-gray-400 mt-1">
            지원 형식: 이미지(JPG, PNG, GIF, WebP), 동영상(MP4, WebM, MOV)
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </Card>

      {Object.entries(uploadProgress).map(([key, progress]) => (
        progress.status === 'uploading' && (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{progress.fileName}</span>
              <span className="text-xs text-gray-500">업로드 중...</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
          </Card>
        )
      ))}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="font-medium">업로드된 파일 ({uploadedFiles.length}/{maxFiles})</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="p-2 relative">
                <div className="aspect-square rounded overflow-hidden mb-2 bg-gray-100">
                  {file.type === 'image' ? (
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      {file.animatedThumbnailUrl ? (
                        <img 
                          src={file.animatedThumbnailUrl} 
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-xs">동영상</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs font-medium truncate">{file.fileName}</div>
                  <div className="flex gap-1 flex-wrap mb-1">
                    {file.isRepresentative && (
                      <Badge variant="secondary" className="text-xs">대표</Badge>
                    )}
                    {file.requiresSignedUrl && (
                      <Badge variant="outline" className="text-xs">🔒 Signed</Badge>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 px-2 text-xs w-full"
                  >
                    삭제
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}