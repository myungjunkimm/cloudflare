/**
 * 파일 썸네일 생성 유틸리티
 * FileReader API와 URL.createObjectURL()을 사용
 */

/**
 * 이미지 파일 썸네일 생성 (FileReader API 사용)
 * @param {File} file - 이미지 파일
 * @param {Object} options - 썸네일 옵션
 * @returns {Promise<string>} Base64 데이터 URL
 */
export function createImageThumbnail(file, options = {}) {
  const { maxWidth = 150, maxHeight = 150, quality = 0.8 } = options;
  
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('이미지 파일이 아닙니다.'));
      return;
    }

    // FileReader로 파일을 Base64 데이터 URL로 읽기
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const img = new Image();
      
      img.onload = function() {
        // Canvas를 사용해서 리사이즈
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 비율 유지하면서 리사이즈 계산
        const aspectRatio = img.width / img.height;
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
        if (newWidth > img.width) {
          newWidth = img.width;
          newHeight = img.height;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 고품질 렌더링 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // 썸네일 데이터 URL 반환
        const thumbnailDataURL = canvas.toDataURL('image/jpeg', quality);
        resolve(thumbnailDataURL);
      };
      
      img.onerror = function() {
        reject(new Error('이미지 로드에 실패했습니다.'));
      };
      
      // FileReader로 읽은 Base64 데이터 URL을 이미지에 설정
      img.src = e.target.result;
    };
    
    reader.onerror = function() {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };
    
    // 파일을 Base64 데이터 URL로 읽기 시작
    reader.readAsDataURL(file);
  });
}

/**
 * 비디오 파일 썸네일 생성 (URL.createObjectURL 사용)
 * @param {File} file - 비디오 파일
 * @param {Object} options - 썸네일 옵션
 * @returns {Promise<string>} Canvas로 생성한 썸네일 데이터 URL
 */
export function createVideoThumbnail(file, options = {}) {
  const { 
    timeOffset = 1, // 1초 지점
    maxWidth = 150, 
    maxHeight = 150,
    quality = 0.8 
  } = options;
  
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('비디오 파일이 아닙니다.'));
      return;
    }

    // URL.createObjectURL로 Blob URL 생성
    const video = document.createElement('video');
    const blobURL = URL.createObjectURL(file);
    video.src = blobURL;
    video.muted = true; // 음소거로 설정
    
    // 비디오 메타데이터가 로드되면
    video.addEventListener('loadeddata', function() {
      // 지정된 시간으로 이동 (1초 지점)
      video.currentTime = Math.min(timeOffset, video.duration);
    });
    
    // 시간 이동이 완료되면
    video.addEventListener('seeked', function() {
      try {
        // Canvas를 사용해서 비디오 프레임 캡처
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 비율 유지하면서 리사이즈 계산
        const aspectRatio = video.videoWidth / video.videoHeight;
        let newWidth = maxWidth;
        let newHeight = maxHeight;
        
        if (aspectRatio > 1) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 비디오 프레임을 Canvas에 그리기
        ctx.drawImage(video, 0, 0, newWidth, newHeight);
        
        // 썸네일 데이터 URL 생성
        const thumbnailDataURL = canvas.toDataURL('image/jpeg', quality);
        
        // 메모리 정리
        URL.revokeObjectURL(blobURL);
        
        resolve(thumbnailDataURL);
      } catch (error) {
        URL.revokeObjectURL(blobURL);
        reject(new Error('비디오 썸네일 생성에 실패했습니다: ' + error.message));
      }
    });
    
    video.addEventListener('error', function() {
      URL.revokeObjectURL(blobURL);
      reject(new Error('비디오 로드에 실패했습니다.'));
    });
    
    // 비디오 로드 시작
    video.load();
  });
}

/**
 * 파일 타입에 따라 자동으로 썸네일 생성
 * @param {File} file - 썸네일을 생성할 파일
 * @param {Object} options - 썸네일 옵션
 * @returns {Promise<Object>} 썸네일 정보
 */
export function createThumbnail(file, options = {}) {
  return new Promise((resolve, reject) => {
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeFormatted: formatFileSize(file.size)
    };
    
    if (file.type.startsWith('image/')) {
      createImageThumbnail(file, options)
        .then(thumbnail => {
          resolve({
            ...fileInfo,
            mediaType: 'image',
            thumbnail,
            previewType: 'image'
          });
        })
        .catch(reject);
    } else if (file.type.startsWith('video/')) {
      createVideoThumbnail(file, options)
        .then(thumbnail => {
          resolve({
            ...fileInfo,
            mediaType: 'video',
            thumbnail,
            previewType: 'image' // 비디오도 썸네일은 이미지
          });
        })
        .catch(reject);
    } else {
      // 지원하지 않는 파일 타입
      resolve({
        ...fileInfo,
        mediaType: 'unknown',
        thumbnail: null,
        previewType: 'none'
      });
    }
  });
}

/**
 * 여러 파일의 썸네일을 동시에 생성
 * @param {FileList|File[]} files - 파일 배열
 * @param {Object} options - 썸네일 옵션
 * @returns {Promise<Object[]>} 썸네일 정보 배열
 */
export function createMultipleThumbnails(files, options = {}) {
  const fileArray = Array.from(files);
  const promises = fileArray.map(file => createThumbnail(file, options));
  return Promise.all(promises);
}

/**
 * 파일 크기를 읽기 쉬운 형태로 포맷
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷된 크기 문자열
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 간단한 이미지 미리보기 (FileReader만 사용)
 * @param {File} file - 이미지 파일
 * @returns {Promise<string>} Base64 데이터 URL
 */
export function createSimpleImagePreview(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('이미지 파일이 아닙니다.'));
      return;
    }

    // 단순히 FileReader로 Base64 데이터 URL 생성
    const reader = new FileReader();
    
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    
    reader.onerror = function() {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * 간단한 비디오 미리보기 (URL.createObjectURL만 사용)
 * @param {File} file - 비디오 파일
 * @returns {Promise<string>} Blob URL
 */
export function createSimpleVideoPreview(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('비디오 파일이 아닙니다.'));
      return;
    }

    try {
      // URL.createObjectURL로 Blob URL 생성
      const blobURL = URL.createObjectURL(file);
      resolve(blobURL);
    } catch (error) {
      reject(new Error('비디오 미리보기 생성에 실패했습니다.'));
    }
  });
}