'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Upload, 
  Send, 
  Calendar as CalendarIcon, 
  MapPin,
  AlertCircle,
  ArrowLeft,
  Share2,
  Ticket,
  Hash,
  Package,
  X,
  Image,
  Film,
  User,
  Phone,
  Info,
  Check,
  Code2,
  Users,
  Loader2
} from 'lucide-react';
import { createVideoThumbnail, createImageThumbnail } from '@/lib/thumbnailUtils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const WritePage = () => {
  // Pretendard 폰트 로드
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    document.body.style.fontFamily = '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // 김알파(본인) 가이드 1명 설정
  const userData = {
    isMember: false,
    isParent: true,
    shareCount: 0,
    name: '김알파',
    dateOfBirth: '2000.01.01',
    isReview: false
  };

  // 가이드 1명 설정
  const guides = [
    { id: 'guide1', name: '김가이드' }
  ];

  // 상태 관리
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [publicConsent, setPublicConsent] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailType, setDetailType] = useState(''); // privacy, public, marketing
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentGuideIndex] = useState(0);

  // Form states
  const [selectedCompanion, setSelectedCompanion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorBirthDate, setAuthorBirthDate] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track uploading status
  const uploadAbortControllers = useRef({}); // Store abort controllers for cancellation
  
  // 가이드 평가 데이터
  const [guideEvaluations, setGuideEvaluations] = useState({
    guide1: {
      selectedKeywords: [],
      isGuideRecommended: false,
      npsScore: null
    }
  });

  // 동행인 선택지
  const companions = [
    { id: 'alone', label: '혼자' },
    { id: 'couple', label: '연인/커플' },
    { id: 'spouse', label: '배우자/신혼여행' },
    { id: 'family', label: '가족' },
    { id: 'friends', label: '친구' },
    { id: 'colleagues', label: '동료' },
    { id: 'club', label: '동호회/모임' },
    { id: 'others', label: '기타' }
  ];

  // 키워드 카테고리
  const keywordCategories = [
    {
      title: '가이드 서비스',
      keywords: [
        { id: 'guide-knowledge', label: '전문 지식이 풍부하고 설명을 잘해요', emoji: '🧠' },
        { id: 'guide-no-pressure', label: '일정에 대한 안내를 잘해줘요', emoji: '🗣️' },
        { id: 'guide-friendly', label: '친근하고 편안한 분위기를 만들어요', emoji: '😊' },
        { id: 'guide-attentive', label: '참가자 상태를 잘 살피고 케어해요', emoji: '👀' },
        { id: 'guide-flexible', label: '상황에 맞게 유연하게 대응해요', emoji: '🔄' },     
        { id: 'guide-storytelling', label: '흥미로운 이야기로 지루하지 않아요', emoji: '📖' },
      ]
    },
    {
      title: '일정 & 코스',
      keywords: [
        { id: 'schedule-efficient', label: '일정이 알차고 효율적이에요', emoji: '📋' },
        { id: 'schedule-timing', label: '각 장소의 관람 시간이 적절해요', emoji: '⏱️' },
        { id: 'schedule-organized', label: '일정표의 관광지를 모두 방문했어요', emoji: '✅' },  
        { id: 'schedule-highlight', label: '현지 문화와 역사를 깊이 이해할 수 있어요', emoji: '🏛️' },
        { id: 'schedule-flexible', label: '현지 상황에 맞게 일정을 잘 조정해요', emoji: '🔄' },
        { id: 'schedule-shopping', label: '방문한 관광지가 흥미롭고 알차요', emoji: '🎯' }
      ]
    },
    {
      title: '숙박 & 음식',
      keywords: [
        { id: 'hotel-quality', label: '호텔이 깨끗하고 편안해요', emoji: '🏨' },       
        { id: 'meal-quality', label: '식사가 맛있고 정성스러워요', emoji: '🍽️' },     
        { id: 'meal-variety', label: '다양한 현지 음식을 경험했어요', emoji: '🍜' },
        { id: 'meal-consideration', label: '개인 취향과 알레르기를 배려해요', emoji: '💚' },
        { id: 'restaurant-choice', label: '좋은 식당을 선정했어요', emoji: '⭐' },
        { id: 'meal-time', label: '식사 시간이 적절해요', emoji: '🕐' }             
      ]
    },
    {
      title: '가격 & 투명성',
      keywords: [
        { id: 'value-total', label: '가격 대비 만족도가 높아요', emoji: '💰' },
        { id: 'value-transparent', label: '예고되지 않은 추가 비용이 없어요', emoji: '📊' },
        { id: 'value-option', label: '옵션 투어 가격이 합리적이에요', emoji: '💳' },
        { id: 'value-included', label: '포함된 서비스가 많아요', emoji: '📦' },
        { id: 'value-worth', label: '지불한 만큼의 가치가 있어요', emoji: '💎' },
        { id: 'value-clear', label: '비용 안내가 명확하고 상세해요', emoji: '📋' }
      ]
    },
    {
      title: '특별한 경험',
      keywords: [
        { id: 'exp-exceed', label: '기대 이상으로 만족스러워요', emoji: '🌟' },
        { id: 'exp-enriched', label: '가이드 덕분에 여행이 풍성해졌어요', emoji: '🌟' },
        { id: 'exp-perfect', label: '여행의 모든 순간이 완벽해요', emoji: '✨' },
        { id: 'exp-photo', label: '인생샷을 건질 수 있는 장소예요', emoji: '📸' },
        { id: 'exp-unforgettable', label: '평생 잊지 못할 여행이에요', emoji: '🌈' }, 
        { id: 'exp-memory', label: '오래도록 기억에 남는 여행이에요', emoji: '💝' }
      ]
    }
  ];

  // 토스트 메시지 표시
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 현재 가이드 정보 가져오기
  const getCurrentGuide = () => guides[currentGuideIndex];
  const getCurrentGuideId = () => getCurrentGuide().id;
  const getCurrentEvaluation = () => guideEvaluations[getCurrentGuideId()];

  // Form handlers
  const handleCompanionSelect = (companionId) => {
    setSelectedCompanion(companionId);
  };

  const handleKeywordSelect = (keywordId) => {
    const currentGuideId = getCurrentGuideId();
    const currentKeywords = guideEvaluations[currentGuideId].selectedKeywords;
    
    if (currentKeywords.includes(keywordId)) {
      setGuideEvaluations(prev => ({
        ...prev,
        [currentGuideId]: {
          ...prev[currentGuideId],
          selectedKeywords: prev[currentGuideId].selectedKeywords.filter(id => id !== keywordId)
        }
      }));
    } else if (currentKeywords.length < 5) {
      setGuideEvaluations(prev => ({
        ...prev,
        [currentGuideId]: {
          ...prev[currentGuideId],
          selectedKeywords: [...prev[currentGuideId].selectedKeywords, keywordId]
        }
      }));
    } else {
      alert('키워드는 최대 5개까지 선택할 수 있습니다.');
    }
  };

  const handleGuideRecommendation = (recommended) => {
    const currentGuideId = getCurrentGuideId();
    setGuideEvaluations(prev => ({
      ...prev,
      [currentGuideId]: {
        ...prev[currentGuideId],
        isGuideRecommended: recommended
      }
    }));
  };

  const handleNpsScore = (score) => {
    const currentGuideId = getCurrentGuideId();
    setGuideEvaluations(prev => ({
      ...prev,
      [currentGuideId]: {
        ...prev[currentGuideId],
        npsScore: score
      }
    }));
  };

  // Helper function to upload image to Cloudflare Images
  const uploadImageToCloudflare = async (file, tempId) => {
    try {
      // Get upload URL
      const urlResponse = await fetch('/api/upload/signed-image', {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', file);
          return formData;
        })()
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await urlResponse.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return {
        cloudflareId: result.result.id,
        originalUrl: result.result.originalUrl,
        thumbnailUrl: result.result.thumbnailUrl,
        variants: result.result.variants
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // Helper function to upload video to Cloudflare Stream
  const uploadVideoToCloudflare = async (file, tempId, onProgress) => {
    try {
      // Create abort controller for this upload
      const abortController = new AbortController();
      uploadAbortControllers.current[tempId] = abortController;

      // Get tus upload URL for resumable upload
      const urlResponse = await fetch('/api/upload/direct-video', {
        method: 'POST',
        signal: abortController.signal
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get video upload URL');
      }

      const urlResult = await urlResponse.json();
      
      if (!urlResult.success) {
        throw new Error(urlResult.error || 'Failed to get upload URL');
      }

      // Upload video using FormData
      const formData = new FormData();
      formData.append('file', file);

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // After upload, wait a moment for video processing
              const videoId = urlResult.videoId;
              
              // Skip thumbnail API call for now - use default thumbnail from Stream
              // The thumbnail will be automatically generated by Cloudflare Stream

              // Generate thumbnail URLs using the standard Cloudflare Stream format
              const thumbnailUrl = `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`;
              const animatedThumbnailUrl = `https://videodelivery.net/${videoId}/thumbnails/thumbnail.gif`;
              
              resolve({
                cloudflareId: videoId,
                streamUrl: urlResult.urls.streamUrl || `https://videodelivery.net/${videoId}`,
                thumbnailUrl: thumbnailUrl,
                animatedThumbnailUrl: animatedThumbnailUrl
              });
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('Video upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', urlResult.uploadUrl);
        xhr.send(formData);

        // Store abort function
        uploadAbortControllers.current[tempId] = () => xhr.abort();
      });
    } catch (error) {
      console.error('Video upload error:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = 5 - uploadedFiles.length;
    
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo', 'video/mpeg'];
    const maxFileSize = 200 * 1024 * 1024; // 200MB in bytes
    
    const validFiles = files.filter(file => {
      const isValidType = [...supportedImageTypes, ...supportedVideoTypes].includes(file.type);
      const isValidSize = file.size <= maxFileSize;
      
      if (!isValidType) {
        alert(`${file.name}: 지원하지 않는 파일 형식입니다.`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name}: 파일 크기가 200MB를 초과합니다.`);
        return false;
      }
      return true;
    });
    
    const filesToAdd = validFiles.slice(0, remainingSlots);
    
    if (validFiles.length > remainingSlots) {
      alert(`최대 5개까지만 업로드할 수 있습니다. ${filesToAdd.length}개의 파일만 추가됩니다.`);
    }
    
    // Process files - show thumbnails immediately, then upload
    filesToAdd.forEach(async (file) => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const isImage = supportedImageTypes.includes(file.type);
      const isVideo = supportedVideoTypes.includes(file.type);
      
      // Create blob URL immediately for instant preview
      const blobUrl = URL.createObjectURL(file);
      
      // Add file immediately with blob preview
      const initialFileObj = {
        id: tempId,
        file,
        preview: blobUrl,
        localThumbnail: null,
        type: isImage ? 'image' : isVideo ? 'video' : 'other',
        mimeType: file.type, // Store original MIME type
        status: 'processing', // New status for thumbnail generation
        progress: 0,
        cloudflareId: null,
        thumbnailUrl: null
      };
      
      // Add to uploading files state immediately
      setUploadingFiles(prev => ({
        ...prev,
        [tempId]: { ...initialFileObj }
      }));
      
      // Generate optimized thumbnail asynchronously
      let localThumbnail = null;
      try {
        if (isImage) {
          // Generate image thumbnail
          localThumbnail = await createImageThumbnail(file, {
            maxWidth: 200,
            maxHeight: 200,
            quality: 0.9
          });
        } else if (isVideo) {
          // Generate video thumbnail at 1 second
          localThumbnail = await createVideoThumbnail(file, {
            timeOffset: 1, // 1초 지점으로 변경
            maxWidth: 200,
            maxHeight: 200,
            quality: 0.9
          });
        }
        
        // Update with optimized thumbnail
        if (localThumbnail) {
          setUploadingFiles(prev => ({
            ...prev,
            [tempId]: { 
              ...prev[tempId], 
              localThumbnail,
              status: 'uploading' // Now ready to upload
            }
          }));
        }
      } catch (error) {
        console.warn('Thumbnail generation failed:', error);
        // Continue with blob preview
        setUploadingFiles(prev => ({
          ...prev,
          [tempId]: { 
            ...prev[tempId],
            status: 'uploading' // Start upload anyway
          }
        }));
      }
      
      try {
        let uploadResult;
        
        // Get current file data from state
        const currentFileData = await new Promise((resolve) => {
          setUploadingFiles(prev => {
            resolve(prev[tempId]);
            return prev;
          });
        });
        
        if (isImage) {
          // Upload image with smooth progress simulation
          let currentProgress = 0;
          
          const updateProgress = () => {
            currentProgress += Math.random() * 15 + 10; // 10-25% increments
            if (currentProgress > 90) currentProgress = 90; // Cap at 90% until upload completes
            
            setUploadingFiles(prev => ({
              ...prev,
              [tempId]: { ...prev[tempId], progress: Math.round(currentProgress) }
            }));
          };
          
          // Start progress simulation
          updateProgress();
          const progressInterval = setInterval(updateProgress, 200);
          
          try {
            uploadResult = await uploadImageToCloudflare(file, tempId);
            
            // Clear interval and complete progress
            clearInterval(progressInterval);
            setUploadingFiles(prev => ({
              ...prev,
              [tempId]: { ...prev[tempId], progress: 100 }
            }));
          } catch (error) {
            // Clear interval on error too
            clearInterval(progressInterval);
            throw error;
          }
        } else if (isVideo) {
          // Upload video with progress tracking
          uploadResult = await uploadVideoToCloudflare(file, tempId, (progress) => {
            setUploadingFiles(prev => ({
              ...prev,
              [tempId]: { ...prev[tempId], progress: Math.round(progress) }
            }));
          });
        }
        
        // Create completed file object - use Cloudflare URLs for storage
        const completedFile = {
          ...currentFileData,
          cloudflareId: uploadResult.cloudflareId,
          // Store actual Cloudflare URLs for better quality in reviews
          cloudflareUrl: uploadResult.originalUrl || uploadResult.streamUrl,
          thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.animatedThumbnailUrl,
          variants: uploadResult.variants, // Store variants for different sizes
          status: 'completed',
          progress: 100,
          isRepresentative: false // Will be set below based on position
        };
        
        // Remove from uploading
        setUploadingFiles(prev => {
          const newState = { ...prev };
          delete newState[tempId];
          return newState;
        });
        
        // Add to uploaded files with success animation
        setUploadedFiles(prev => {
          const newFiles = [...prev, completedFile];
          // Keep first file as representative, new files are not representative
          return newFiles.map((file, index) => ({
            ...file,
            isRepresentative: index === 0 // Only first file is representative
          }));
        });
        
        // Trigger success micro-interaction
        setTimeout(() => {
          const element = document.querySelector(`[data-file-id="${completedFile.id}"]`);
          if (element) {
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
              element.style.transform = 'scale(1)';
            }, 200);
          }
        }, 100);
        
        // Clean up blob URL (don't revoke if it's a data URL from thumbnail)
        if (blobUrl && blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrl);
        }
        
      } catch (error) {
        console.error('Upload failed:', error);
        
        // Don't mark as failed if it was cancelled
        if (error.message !== 'Upload cancelled') {
          // Mark as failed
          setUploadingFiles(prev => ({
            ...prev,
            [tempId]: { ...prev[tempId], status: 'failed', error: error.message }
          }));
          
          // Remove from uploading after delay
          setTimeout(() => {
            setUploadingFiles(prev => {
              const newState = { ...prev };
              delete newState[tempId];
              return newState;
            });
            // Clean up blob URL
            if (blobUrl && blobUrl.startsWith('blob:')) {
              URL.revokeObjectURL(blobUrl);
            }
          }, 3000);
        }
      }
    });
  };

  const removeFile = async (index) => {
    const fileToRemove = uploadedFiles[index];
    
    // Clean up blob URL (don't revoke if it's a data URL from thumbnail)
    if (fileToRemove.preview && fileToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    // Remove from UI immediately
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Always set first file as representative after removal
      return newFiles.map((file, i) => ({
        ...file,
        isRepresentative: i === 0
      }));
    });

    // Call delete API in background
    try {
      if (fileToRemove.cloudflareId) {
        const deleteEndpoint = fileToRemove.mimeType?.startsWith('video/') 
          ? '/api/delete/video' 
          : '/api/delete/image';
        
        const idField = fileToRemove.mimeType?.startsWith('video/') 
          ? 'videoId' 
          : 'imageId';
        
        const response = await fetch(deleteEndpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [idField]: fileToRemove.cloudflareId
          }),
        });

        if (!response.ok) {
          console.error('Failed to delete file from Cloudflare:', await response.json());
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const cancelUpload = (tempId) => {
    // Cancel the upload if abort controller exists
    if (uploadAbortControllers.current[tempId]) {
      if (typeof uploadAbortControllers.current[tempId] === 'function') {
        uploadAbortControllers.current[tempId]();
      } else if (uploadAbortControllers.current[tempId].abort) {
        uploadAbortControllers.current[tempId].abort();
      }
      delete uploadAbortControllers.current[tempId];
    }
    
    // Remove from uploading files and clean up blob URLs
    setUploadingFiles(prev => {
      const newState = { ...prev };
      const fileToRemove = newState[tempId];
      
      if (fileToRemove) {
        // Clean up blob URL only (not data URLs)
        if (fileToRemove.preview && fileToRemove.preview.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(fileToRemove.preview);
          } catch (e) {
            console.warn('Failed to revoke blob URL:', e);
          }
        }
      }
      
      delete newState[tempId];
      return newState;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 업로드 진행 중인지 확인
    const isUploading = Object.keys(uploadingFiles).length > 0;
    if (isUploading) {
      alert('파일 업로드가 진행 중입니다. 업로드 완료 후 다시 시도해주세요.');
      return;
    }
    
    // 키워드가 선택되었는지 확인
    const currentEvaluation = getCurrentEvaluation();
    if (currentEvaluation.selectedKeywords.length === 0) {
      alert(`${getCurrentGuide().name}에 대한 좋았던 점을 최소 1개 이상 선택해주세요.`);
      return;
    }
    
    // NPS 점수가 선택되었는지 확인
    if (currentEvaluation.npsScore === null) {
      alert('가이드 추천 점수를 선택해주세요.');
      return;
    }
    
    // 최종 제출
    setShowConsentModal(true);
  };

  const handleFinalSubmit = () => {
    if (!privacyConsent || !publicConsent) {
      alert('필수 항목에 모두 동의해주세요.');
      return;
    }
    
    // Clean up files - remove localThumbnail and preview URLs to save space
    const cleanedFiles = uploadedFiles.map(file => {
      const { localThumbnail, preview, file: originalFile, ...cleanFile } = file;
      return cleanFile;
    });

    const submitData = {
      id: Date.now().toString(),
      authorInfo: {
        name: authorName,
        birthDate: authorBirthDate
      },
      companion: selectedCompanion,
      guideEvaluations,
      reviewText,
      files: cleanedFiles,
      privacyConsent,
      marketingConsent,
      createdAt: new Date().toISOString()
    };

    console.log('제출 데이터:', submitData);

    // Save to localStorage
    try {
      const existingReviews = JSON.parse(localStorage.getItem('travelReviews') || '[]');
      existingReviews.push(submitData);
      localStorage.setItem('travelReviews', JSON.stringify(existingReviews));
      console.log('리뷰가 localStorage에 저장되었습니다.');
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
    }
    
    setShowConsentModal(false);
    showToastMessage('리뷰가 성공적으로 제출되었습니다!');
    
    // 리뷰 제출 완료 처리
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  // 리뷰 작성 폼
  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.location.href = '/'}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">리뷰 작성</h1>
            <div className="w-9" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* 상품 제목 */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight" style={{ fontWeight: 700 }}>
                [홈앤쇼핑] 오사카/교토/아라시야마 4일 (노면전차+천연온천욕+1일자유)
              </h2>
            </div>
          </div>
        </div>

        {/* 1. 작성자 정보 */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontWeight: 500 }}>
            작성자 정보
          </h3>
          
          {/* 이름 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 생년월일 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              생년월일
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                >
                  {authorBirthDate ? (
                    format(new Date(authorBirthDate), 'yyyy-MM-dd', { locale: ko })
                  ) : (
                    <span className="text-gray-500">생년월일을 선택해주세요 (YYYY-MM-DD)</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={authorBirthDate ? new Date(authorBirthDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setAuthorBirthDate(format(date, 'yyyy-MM-dd'));
                    }
                  }}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 2. 동행인 선택 */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontWeight: 500 }}>
            누구와 함께 여행하셨나요?
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {companions.map(companion => (
              <button
                key={companion.id}
                onClick={() => handleCompanionSelect(companion.id)}
                className={`p-2.5 rounded-2xl border transition-all text-xs font-medium text-center ${
                  selectedCompanion === companion.id
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {companion.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 가이드 키워드 선택 */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900" style={{ fontWeight: 500 }}>
                  어떤점이 좋았는지 선택해주세요!
                </h3>
              </div>
              <span className="bg-black text-white text-xs px-2 py-1 rounded-md">필수</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-md transition-all duration-500 ${
                getCurrentEvaluation().selectedKeywords.length === 5 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getCurrentEvaluation().selectedKeywords.length}/5
              </span>
              {getCurrentEvaluation().selectedKeywords.length === 5 && (
                <span className="text-blue-500 animate-bounce text-lg">🎉</span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">키워드를 골라주세요 (1-5개)</p>

          {keywordCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-4 last:mb-0">
              <h4 className="text-base font-medium text-gray-800 mb-3">
               {category.title}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {category.keywords.map(keyword => (
                  <button
                    key={keyword.id}
                    onClick={() => handleKeywordSelect(keyword.id)}
                    disabled={!getCurrentEvaluation().selectedKeywords.includes(keyword.id) && getCurrentEvaluation().selectedKeywords.length >= 5}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      getCurrentEvaluation().selectedKeywords.includes(keyword.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : getCurrentEvaluation().selectedKeywords.length >= 5
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">{keyword.emoji}</span>
                    <span className="text-sm font-medium">{keyword.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 3. 가이드 추천 */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900" style={{ fontWeight: 500 }}>
              {getCurrentGuide().name}이(가) 마음에 들었다면?
            </h3>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">선택</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            (다음에 가이드가 운영하는 상품에 또 추천해드립니다)
          </p>
          <button
            onClick={() => handleGuideRecommendation(!getCurrentEvaluation().isGuideRecommended)}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all w-full ${
              getCurrentEvaluation().isGuideRecommended
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Heart 
              className={`w-6 h-6 transition-all ${
                getCurrentEvaluation().isGuideRecommended ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`} 
            />
            <span className="font-medium">
              {getCurrentEvaluation().isGuideRecommended ? '가이드를 추천합니다!' : '가이드 추천하기'}
            </span>
          </button>
        </div>

        {/* 4. NPS 점수 */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-medium text-gray-900" style={{ fontWeight: 500 }}>
              {getCurrentGuide().name}을(를) 주변 사람들에게 추천하시겠습니까?
            </h3>
            <span className="bg-black text-white text-xs px-2 py-1 rounded-md">필수</span>
          </div>
          <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
            <span>전혀 추천하지 않음</span>
            <span>매우 추천함</span>
          </div>
          <div className="grid grid-cols-11 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <button
                key={score}
                onClick={() => handleNpsScore(score)}
                className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                  getCurrentEvaluation().npsScore === score
                    ? 'bg-blue-500 text-white shadow-lg scale-110'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* 5. 리뷰 작성 */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900" style={{ fontWeight: 500 }}>리뷰 작성</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">선택</span>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                  !
                </button>
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg z-10 w-64">
                    <div className="space-y-1">
                      <p className="font-semibold text-yellow-200">리뷰 작성 안내</p>
                      <p>• 욕설, 비속어 사용 금지</p>
                      <p>• 허위 정보, 과장된 내용 금지</p>
                      <p>• 개인정보 노출 금지</p>
                      <p>• 부적절한 내용 작성 시 삭제 처리</p>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
              {reviewText.length}/500
            </span>
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setReviewText(e.target.value);
              }
            }}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              const currentText = reviewText;
              const newText = currentText + pastedText;
              
              if (newText.length <= 500) {
                // 500자 이하면 그대로 붙여넣기
                setReviewText(newText);
              } else {
                // 500자 초과하면 잘라서 붙여넣기
                const remainingChars = 500 - currentText.length;
                const truncatedPaste = pastedText.substring(0, remainingChars);
                setReviewText(currentText + truncatedPaste);
              }
              e.preventDefault();
            }}
            rows={6}
            className="w-full px-0 py-0 border-0 focus:ring-0 text-base resize-none bg-transparent"
            placeholder="여행에서 경험한 특별한 순간이나 느낀 점을 자세히 적어주세요. (최대 500자)"
            style={{ 
              color: reviewText ? '#000' : '#9CA3AF',
              fontSize: '16px',
              lineHeight: '1.6',
              fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontWeight: reviewText ? 400 : 400
            }}
          />
        </div>

        {/* 6. 파일 업로드 */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900" style={{ fontWeight: 500 }}>이미지 & 동영상 업로드</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">선택</span>
            </div>
            <span className="text-sm text-gray-500">{uploadedFiles.length}/5</span>
          </div>
          
          {/* 썸네일 캐로셀 - 한 줄 유지 */}
          <div className="relative">
            <div 
              className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
            {/* 추가 버튼 - 항상 첫 번째 위치 */}
            {(uploadedFiles.length + Object.keys(uploadingFiles).length) < 5 && (
              <div className="relative flex-shrink-0">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/mpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={Object.keys(uploadingFiles).length > 0}
                />
                <label 
                  htmlFor="file-upload" 
                  className={`w-28 h-28 rounded-xl border-2 border-gray-300 bg-gray-50 flex flex-col items-center justify-center transition-colors ${
                    Object.keys(uploadingFiles).length > 0 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer hover:bg-gray-100 hover:border-gray-400'
                  }`}
                >
                  <div className="text-gray-500 text-3xl font-light mb-1">+</div>
                  <div className="text-gray-500 text-sm">
                    {uploadedFiles.length + Object.keys(uploadingFiles).length}/5
                  </div>
                </label>
              </div>
            )}
            
            {/* 업로드된 파일들 */}
            {uploadedFiles.map((fileObj, index) => (
              <div 
                key={fileObj.id || index} 
                data-file-id={fileObj.id}
                className={`relative group transition-all duration-300 flex-shrink-0 ${
                  fileObj.status === 'completed' ? 'hover:scale-105' : ''
                }`}
              >
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 relative transition-all duration-500 shadow-sm">
                  {/* Always use local thumbnail/preview - no API calls needed for display */}
                  {fileObj.localThumbnail ? (
                    <img 
                      src={fileObj.localThumbnail}
                      alt={fileObj.file?.name || 'uploaded'}
                      className="w-full h-full object-cover"
                    />
                  ) : fileObj.type === 'image' && fileObj.preview ? (
                    <img 
                      src={fileObj.preview} 
                      alt={fileObj.file?.name || 'uploaded'}
                      className="w-full h-full object-cover"
                    />
                  ) : fileObj.type === 'video' && fileObj.preview ? (
                    <div className="relative w-full h-full">
                      <video 
                        src={fileObj.preview}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <Film className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  
                  {/* Success indicator - top gradient shadow */}
                  {fileObj.status === 'completed' && (
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-green-500/20 to-transparent rounded-t-xl"></div>
                  )}
                  
                  {/* 대표 이미지 라벨 - 첫 번째 이미지에만 표시 */}
                  {fileObj.isRepresentative && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black bg-opacity-75 text-white text-xs font-medium px-2 py-1 rounded-md">
                        대표
                      </span>
                    </div>
                  )}
                </div>
                {/* X button - inside image bounds, consistent with uploading files */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 hover:border-2 hover:border-white text-white rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 z-10"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
            
            {/* 업로드 중인 파일들 - 업로드된 파일들 뒤에 배치 */}
            {Object.entries(uploadingFiles).map(([tempId, fileObj]) => (
              <div key={tempId} className="relative group flex-shrink-0">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 relative">
                  {/* Show thumbnail or preview */}
                  {fileObj.localThumbnail ? (
                    <img 
                      src={fileObj.localThumbnail}
                      alt={fileObj.file.name}
                      className={`w-full h-full object-cover ${
                        fileObj.status === 'uploading' ? 'opacity-70' : ''
                      }`}
                    />
                  ) : fileObj.status === 'processing' ? (
                    <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-1" />
                        <span className="text-xs text-gray-500">썸네일 생성중</span>
                      </div>
                    </div>
                  ) : fileObj.preview ? (
                    <img 
                      src={fileObj.preview} 
                      alt={fileObj.file.name}
                      className={`w-full h-full object-cover ${
                        fileObj.status === 'uploading' ? 'opacity-70' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  
                  {/* Failed status overlay */}
                  {fileObj.status === 'failed' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60">
                      <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                      <p className="text-white text-xs">업로드 실패</p>
                    </div>
                  )}
                </div>
                
                {/* Upload progress overlay */}
                {(fileObj.status === 'uploading' || fileObj.status === 'processing') && (
                  <>
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center">
                      {fileObj.status === 'processing' ? (
                        <>
                          <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
                          <span className="text-white text-xs font-medium">썸네일 생성중...</span>
                        </>
                      ) : (
                        <>
                          {/* Circular progress */}
                          <div className="relative w-14 h-14 mb-2">
                            <svg className="w-14 h-14 transform -rotate-90">
                              <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="3"
                                fill="none"
                              />
                              <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="white"
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 24}`}
                                strokeDashoffset={`${2 * Math.PI * 24 * (1 - fileObj.progress / 100)}`}
                                className="transition-all duration-500 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{fileObj.progress}%</span>
                            </div>
                          </div>
                          <span className="text-white text-xs font-medium">업로드 중...</span>
                        </>
                      )}
                    </div>
                    
                    {/* Cancel button - positioned over overlay */}
                    <button
                      onClick={() => cancelUpload(tempId)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 hover:border-2 hover:border-white text-white rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 z-10"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </>
                )}
                
                {/* Failed status */}
                {fileObj.status === 'failed' && (
                  <>
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
                      <span className="text-white text-xs font-medium">업로드 실패</span>
                    </div>
                    <button
                      onClick={() => cancelUpload(tempId)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 hover:border-2 hover:border-white text-white rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 z-10"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={getCurrentEvaluation().selectedKeywords.length === 0 || Object.keys(uploadingFiles).length > 0}
          className="w-full py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors font-medium text-lg disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
          style={{ fontWeight: 500 }}
        >
          {Object.keys(uploadingFiles).length > 0 
            ? `업로드 중... (${Object.keys(uploadingFiles).length}개 파일)`
            : '리뷰 등록'
          }
        </button>

      </div>

      {/* 동의 모달 */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowConsentModal(false)}
          />
          
          {/* 모달 내용 */}
          <div className="relative bg-white w-full max-w-2xl rounded-t-3xl animate-slide-in-up mx-auto">
            {/* 헤더 */}
            <div className="pt-4 pb-2 px-6 border-b border-gray-100">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">
                리뷰 작성을 위한 동의
              </h3>
            </div>
            
            <div className="p-6">
              {/* 전체 동의 */}
              <div className="mb-4">
                <div 
                  onClick={() => {
                    const newValue = !(privacyConsent && publicConsent && marketingConsent);
                    setPrivacyConsent(newValue);
                    setPublicConsent(newValue);
                    setMarketingConsent(newValue);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    privacyConsent && publicConsent && marketingConsent 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    privacyConsent && publicConsent && marketingConsent 
                      ? 'bg-blue-500' 
                      : 'bg-white border-2 border-gray-300'
                  }`}>
                    {(privacyConsent && publicConsent && marketingConsent) && (
                      <Check size={16} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-gray-900">
                      전체 동의하기
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {/* 개인정보 수집 동의 */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div 
                    onClick={() => setPrivacyConsent(!privacyConsent)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      privacyConsent 
                        ? 'bg-blue-500' 
                        : 'bg-white border-2 border-gray-300'
                    }`}>
                      {privacyConsent && (
                        <Check size={14} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">필수</span>
                      <p className="text-sm font-medium text-gray-900">
                        개인정보 수집·이용 동의
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailType('privacy');
                      setShowDetailModal(true);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline px-2 py-1"
                  >
                    자세히
                  </button>
                </div>
                
                {/* 여행 후기 공개 동의 */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div 
                    onClick={() => setPublicConsent(!publicConsent)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      publicConsent 
                        ? 'bg-blue-500' 
                        : 'bg-white border-2 border-gray-300'
                    }`}>
                      {publicConsent && (
                        <Check size={14} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">필수</span>
                      <p className="text-sm font-medium text-gray-900">
                        여행 후기 활용 및 공개 동의
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailType('public');
                      setShowDetailModal(true);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline px-2 py-1"
                  >
                    자세히
                  </button>
                </div>
                
                {/* 마케팅 정보 활용 */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div 
                    onClick={() => setMarketingConsent(!marketingConsent)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      marketingConsent 
                        ? 'bg-blue-500' 
                        : 'bg-white border-2 border-gray-300'
                    }`}>
                      {marketingConsent && (
                        <Check size={14} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">선택</span>
                      <p className="text-sm font-medium text-gray-900">
                        마케팅 정보 수신 동의
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailType('marketing');
                      setShowDetailModal(true);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline px-2 py-1"
                  >
                    자세히
                  </button>
                </div>
              </div>
            </div>
            
            {/* 하단 버튼 영역 */}
            <div className="bg-white border-t border-gray-100 p-6">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={!privacyConsent || !publicConsent}
                  className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  동의하고 리뷰 등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 상세 정보 모달 */}
      {showDetailModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-70"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-3xl max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {detailType === 'privacy' && '개인정보 수집·이용 안내'}
                  {detailType === 'public' && '여행 후기 공개 안내'}
                  {detailType === 'marketing' && '마케팅 정보 활용'}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              {detailType === 'privacy' && (
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">처리하는 개인정보 항목 및 보유기간 안내</h4>
                    <p className="mb-3">김투어는 다음과 같은 목적으로 개인정보를 수집합니다.</p>
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-r border-gray-200">수집항목</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-r border-gray-200">수집목적</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">보유 및 이용기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">이름(국문), 생년월일, 휴대폰전화번호</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">후기 작성을 위한 여행 상품 확인, 후기 이벤트 진행 시 담청자 식별 및 경품 발송</td>
                          <td className="px-3 py-2 text-xs">이용목적 달성 시</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">동의를 거부할 권리 및 동의를 거부할 경우의 불이익</h4>
                    <p>개인정보주체는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 동의를 거부할 경우 서비스 이용에 제한이 있을 수 있음을 알려드립니다.</p>
                  </div>
                </div>
              )}
              
              {detailType === 'public' && (
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">[필수] 여행 후기 활용 및 공개 동의에 대한 안내</h4>
                    <p>작성하신 게시물은 서비스의 &apos;여행 후기&apos;, &apos;SNS채널(인스타그램, 페이스북)&apos;, &apos;썸네일&apos;의 상품 홍보, 마케팅 콘텐츠로 활용되어 불특정 다수에게 공개됩니다.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">동의를 거부할 권리 및 동의를 거부할 경우의 불이익</h4>
                    <p>개인정보주체는 여행 후기 활용 및 공개 동의를 거부할 권리가 있습니다. 동의를 거부할 경우 서비스 이용에 제한이 있을 수 있음을 알려드립니다.</p>
                  </div>
                </div>
              )}
              
              {detailType === 'marketing' && (
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">할인 이벤트 및 특가 프로모션 알림 안내</h4>
                    <p className="mb-3">여기어때투어는 광고성 정보 전송을 목적으로 다음과 같이 개인정보를 수집 및 이용합니다.</p>
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-r border-gray-200">수집항목</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-r border-gray-200">수집목적</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">보유 및 이용기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">(선택)<br/>휴대전화번호, 기기정보(기기종류, OS버전)</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">SMS/MMS, PUSH를 이용한 맞춤서비스 제공, 이벤트 안내, 상품안내, 마케팅 및 광고 활용</td>
                          <td className="px-3 py-2 text-xs">수신거부 시</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">동의를 거부할 권리 및 동의를 거부할 경우의 불이익</h4>
                    <p>개인정보주체는 마케팅 정보 활용을 거부할 권리가 있습니다. 동의를 거부할 경우 서비스 이용에 불이익은 없으나, 회원에게 제공되는 서비스가 제한될 수 있습니다.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg mr-4 z-50">
          {toastMessage}
        </div>
      )}
      
    </div>
  );
};

export default WritePage;