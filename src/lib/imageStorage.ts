export interface ImageData {
  id: string;
  uploadURL: string;
  uploadedAt: string;
  fileName?: string;
  status: 'pending' | 'uploaded' | 'failed';
  imageURL?: string; // Cloudflare Images에서 제공하는 최종 이미지 URL
  thumbnailURL?: string; // 썸네일 URL
  variants?: {
    public?: string;
    thumbnail?: string;
    [key: string]: string | undefined;
  };
}

const STORAGE_KEY = 'cloudflare_images';

export const imageStorage = {
  // 모든 이미지 가져오기
  getAll(): ImageData[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // 이미지 추가
  add(image: ImageData): void {
    const images = this.getAll();
    images.unshift(image); // 최신 이미지를 앞에 추가
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  },

  // 이미지 업데이트
  update(id: string, updates: Partial<ImageData>): void {
    const images = this.getAll();
    const index = images.findIndex(img => img.id === id);
    if (index !== -1) {
      images[index] = { ...images[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    }
  },

  // 이미지 삭제
  remove(id: string): void {
    const images = this.getAll();
    const filtered = images.filter(img => img.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // 특정 이미지 가져오기
  getById(id: string): ImageData | null {
    const images = this.getAll();
    return images.find(img => img.id === id) || null;
  },

  // 만료된 uploadURL 정리 (30분 이상 된 pending 상태)
  cleanExpired(): void {
    const images = this.getAll();
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const filtered = images.filter(img => {
      // pending 상태이고 30분이 지났으면 제거
      if (img.status === 'pending' && img.uploadedAt < thirtyMinutesAgo) {
        return false;
      }
      return true;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};