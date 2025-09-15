'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { imageStorage, ImageData } from '@/lib/imageStorage';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 이미지 목록 로드
    loadImages();
    // 만료된 uploadURL 정리
    imageStorage.cleanExpired();
  }, []);

  const loadImages = () => {
    setImages(imageStorage.getAll());
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요');
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    try {
      // 1. 서버에서 uploadURL 가져오기
      const response = await fetch('/api/images/upload-url', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL, id } = await response.json();
      setUploadProgress(40);

      // 2. localStorage에 pending 상태로 저장
      const imageData: ImageData = {
        id,
        uploadURL,
        uploadedAt: new Date().toISOString(),
        fileName: selectedFile.name,
        status: 'pending'
      };
      imageStorage.add(imageData);
      loadImages();

      // 3. Direct Creator Upload 방식으로 Cloudflare에 직접 업로드
      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadProgress(60);

      // Cloudflare Images에 직접 업로드
      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(80);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload response error:', errorText);
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);
      
      // Cloudflare Images는 업로드 후 다양한 변형을 제공
      // 기본 URL 형식: https://imagedelivery.net/{account_hash}/{image_id}/{variant_name}
      const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'ydJcczaKlrbCH-7R2wtX_w';
      const baseURL = `https://imagedelivery.net/${accountHash}/${id}`;
      
      // 업로드 성공 시 상태 업데이트
      imageStorage.update(id, {
        status: 'uploaded',
        imageURL: `${baseURL}/public`, // 원본 크기
        thumbnailURL: `${baseURL}/thumbnail`, // 썸네일
        variants: {
          public: `${baseURL}/public`,
          thumbnail: `${baseURL}/thumbnail`
        }
      });

      setUploadProgress(100);
      loadImages();
      
      // 성공 메시지
      alert('이미지가 성공적으로 업로드되었습니다!');
      
      // 초기화
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('이미지를 삭제하시겠습니까?')) {
      imageStorage.remove(id);
      loadImages();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Images - Direct Upload</h1>
      
      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>이미지 업로드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="flex-1"
              />
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploading}
                className="min-w-[120px]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    업로드
                  </>
                )}
              </Button>
            </div>
            
            {selectedFile && (
              <div className="text-sm text-gray-600">
                선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600">{uploadProgress}% 완료</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}