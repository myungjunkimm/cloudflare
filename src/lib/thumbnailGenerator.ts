export interface ThumbnailOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface ThumbnailResult {
  dataURL: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

/**
 * Canvas API를 사용해서 이미지 파일로부터 썸네일 생성
 */
export const generateThumbnail = async (
  file: File,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> => {
  const {
    maxWidth = 150,
    maxHeight = 150,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Cannot get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        // 원본 이미지 크기
        const { width: originalWidth, height: originalHeight } = img;

        // 비율 유지하면서 리사이즈할 크기 계산
        const aspectRatio = originalWidth / originalHeight;
        let newWidth = maxWidth;
        let newHeight = maxHeight;

        if (aspectRatio > 1) {
          // 가로가 더 긴 경우
          newHeight = newWidth / aspectRatio;
        } else {
          // 세로가 더 긴 경우
          newWidth = newHeight * aspectRatio;
        }

        // 원본보다 크게 만들지 않도록 제한
        if (newWidth > originalWidth) {
          newWidth = originalWidth;
          newHeight = originalHeight;
        }

        // Canvas 크기 설정
        canvas.width = newWidth;
        canvas.height = newHeight;

        // 고품질 렌더링을 위한 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Data URL 생성
        const dataURL = canvas.toDataURL(format, quality);

        // Blob 생성 (필요시 서버 업로드용)
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          resolve({
            dataURL,
            blob,
            width: newWidth,
            height: newHeight,
            size: blob.size
          });
        }, format, quality);

      } catch (error) {
        reject(error);
      } finally {
        // 메모리 정리
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // 이미지 로드 시작
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 여러 크기의 썸네일 생성 (반응형 대응)
 */
export const generateMultipleThumbnails = async (
  file: File,
  sizes: { name: string; width: number; height: number }[] = [
    { name: 'small', width: 64, height: 64 },
    { name: 'medium', width: 150, height: 150 },
    { name: 'large', width: 300, height: 300 }
  ]
): Promise<Record<string, ThumbnailResult>> => {
  const results: Record<string, ThumbnailResult> = {};

  for (const size of sizes) {
    try {
      const thumbnail = await generateThumbnail(file, {
        maxWidth: size.width,
        maxHeight: size.height,
        quality: 0.8
      });
      results[size.name] = thumbnail;
    } catch (error) {
      console.error(`Failed to generate ${size.name} thumbnail:`, error);
    }
  }

  return results;
};

/**
 * 이미지 파일 정보 추출
 */
export const getImageInfo = async (file: File): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
  format: string;
  size: number;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
        format: file.type,
        size: file.size
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for info extraction'));
    };

    img.src = URL.createObjectURL(file);
  });
};