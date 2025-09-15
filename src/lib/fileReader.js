/**
 * FileReader API를 사용한 이미지 파일 처리 유틸리티
 */

/**
 * 파일을 Base64 데이터 URL로 변환
 * @param {File} file - 변환할 파일
 * @returns {Promise<string>} Base64 데이터 URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      reject(new Error('선택한 파일이 이미지가 아닙니다.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    
    reader.onerror = function() {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };
    
    // 파일을 Data URL로 읽기 시작
    reader.readAsDataURL(file);
  });
}

/**
 * 파일을 ArrayBuffer로 변환
 * @param {File} file - 변환할 파일
 * @returns {Promise<ArrayBuffer>} ArrayBuffer
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    
    reader.onerror = function() {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 파일을 텍스트로 변환
 * @param {File} file - 변환할 파일
 * @returns {Promise<string>} 텍스트 내용
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    
    reader.onerror = function() {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * 여러 파일을 동시에 Data URL로 변환
 * @param {FileList|File[]} files - 변환할 파일들
 * @returns {Promise<string[]>} Base64 데이터 URL 배열
 */
export function readMultipleFilesAsDataURL(files) {
  const fileArray = Array.from(files);
  const promises = fileArray.map(file => readFileAsDataURL(file));
  return Promise.all(promises);
}

/**
 * 이미지 파일 정보 추출
 * @param {File} file - 분석할 파일
 * @returns {Promise<Object>} 파일 정보 객체
 */
export function getFileInfo(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('이미지 파일이 아닙니다.'));
      return;
    }

    const info = {
      name: file.name,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified),
    };

    // 이미지 데이터 URL 생성 후 이미지 객체로 로드해서 해상도 확인
    readFileAsDataURL(file)
      .then(dataURL => {
        const img = new Image();
        
        img.onload = function() {
          info.width = img.width;
          info.height = img.height;
          info.aspectRatio = img.width / img.height;
          resolve(info);
        };
        
        img.onerror = function() {
          reject(new Error('이미지 로드에 실패했습니다.'));
        };
        
        img.src = dataURL;
      })
      .catch(reject);
  });
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
 * 이미지 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @param {Object} options - 검사 옵션
 * @returns {Promise<boolean>} 유효성 여부
 */
export function validateImageFile(file, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      maxSize = 10 * 1024 * 1024, // 기본 10MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxWidth = null,
      maxHeight = null
    } = options;

    // 파일 타입 검사
    if (!allowedTypes.includes(file.type)) {
      reject(new Error(`허용되지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`));
      return;
    }

    // 파일 크기 검사
    if (file.size > maxSize) {
      reject(new Error(`파일 크기가 너무 큽니다. 최대 크기: ${formatFileSize(maxSize)}`));
      return;
    }

    // 해상도 검사가 필요한 경우
    if (maxWidth || maxHeight) {
      getFileInfo(file)
        .then(info => {
          if (maxWidth && info.width > maxWidth) {
            reject(new Error(`이미지 너비가 너무 큽니다. 최대 너비: ${maxWidth}px`));
            return;
          }
          
          if (maxHeight && info.height > maxHeight) {
            reject(new Error(`이미지 높이가 너무 큽니다. 최대 높이: ${maxHeight}px`));
            return;
          }
          
          resolve(true);
        })
        .catch(reject);
    } else {
      resolve(true);
    }
  });
}