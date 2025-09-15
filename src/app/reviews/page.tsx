'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  ArrowLeft,
  ChevronDown,
  Play,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// VideoPlayer를 lazy load
const VideoPlayer = lazy(() => import('@/components/VideoPlayer'));

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [sortOrder, setSortOrder] = useState('최신순');
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const REVIEWS_PER_PAGE = 5;

  // 연령대 계산
  const getAgeGroup = (birthDate: string) => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    
    if (age < 20) return '10대';
    if (age < 30) return '20대';
    if (age < 40) return '30대';
    if (age < 50) return '40대';
    if (age < 60) return '50대';
    return '60대';
  };

  // 동행인 타입 변환
  const getCompanionText = (companion: string) => {
    const companionMap: { [key: string]: string } = {
      'solo': '혼자',
      'couple': '커플',
      'child': '아이와 함께',
      'parent': '부모님과 함께',
      'family': '가족과 함께',
      'friend': '친구와 함께',
      'colleague': '동료와 함께',
      'group': '모임'
    };
    return companionMap[companion] || companion;
  };

  // 상대적 시간 계산
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays === 1) return '어제';
    if (diffDays < 31) return `${diffDays}일 전`;
    if (diffMonths === 1) return '1개월 전';
    if (diffMonths < 12) return `${diffMonths}개월 전`;
    if (diffYears === 1) return '1년 전';
    return `${diffYears}년 전`;
  };

  // 더보기/접기 토글
  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // 텍스트가 3줄을 넘는지 확인하는 함수 (대략적인 계산)
  const isTextLongerThan3Lines = (text: string) => {
    if (!text) return false;
    // 대략적으로 한 줄에 50자 정도로 계산 (실제로는 폰트, 너비에 따라 다름)
    const averageCharsPerLine = 50;
    const maxCharsFor3Lines = averageCharsPerLine * 3;
    return text.length > maxCharsFor3Lines;
  };

  // 미디어 뷰어 열기
  const openMediaViewer = (files: any[], index: number) => {
    setSelectedMedia(files);
    setCurrentMediaIndex(index);
  };

  // 미디어 뷰어 닫기
  const closeMediaViewer = () => {
    setSelectedMedia(null);
    setCurrentMediaIndex(0);
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedMedia) {
        closeMediaViewer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedMedia]);

  // 다음/이전 미디어
  const goToNextMedia = () => {
    if (selectedMedia && currentMediaIndex < selectedMedia.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };

  const goToPrevMedia = () => {
    if (selectedMedia && currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    }
  };

  // 미디어 캐러셀 컴포넌트
  const MediaCarousel = ({ files }: { files: any[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    if (!files || files.length === 0) return null;
    
    const nextSlide = () => {
      setCurrentIndex(prev => (prev + 1) % files.length);
    };
    
    const prevSlide = () => {
      setCurrentIndex(prev => (prev - 1 + files.length) % files.length);
    };
    
    return (
      <div className="relative">
        <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
          {files.map((file, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                index === currentIndex ? 'translate-x-0' : 
                index < currentIndex ? '-translate-x-full' : 'translate-x-full'
              }`}
            >
              {file.type === 'image' ? (
                <img 
                  src={file.variants?.reviewMedium || file.cloudflareUrl || file.localThumbnail || file.preview} 
                  alt={`리뷰 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <img 
                  src={file.cloudflareId ? `https://videodelivery.net/${file.cloudflareId}/thumbnails/thumbnail.jpg?time=1s` : file.localThumbnail || file.preview} 
                  alt={`동영상 썸네일 ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          ))}
          
          {/* 네비게이션 버튼 */}
          {files.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight size={16} className="text-white" />
              </button>
            </>
          )}
          
          {/* 인디케이터 */}
          {files.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
              {files.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* 카운터 */}
          {files.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentIndex + 1}/{files.length}
            </div>
          )}
        </div>
      </div>
    );
  };

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

  // localStorage에서 리뷰 데이터 로드
  useEffect(() => {
    try {
      const savedReviews = JSON.parse(localStorage.getItem('travelReviews') || '[]');
      setReviews(savedReviews);
      // 초기 5개만 표시
      setDisplayedReviews(savedReviews.slice(0, REVIEWS_PER_PAGE));
      setHasMore(savedReviews.length > REVIEWS_PER_PAGE);
    } catch (error) {
      console.error('리뷰 데이터 로드 실패:', error);
    }
  }, []);

  // 더 많은 리뷰 로드
  const loadMoreReviews = () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // 실제 API 호출을 시뮬레이션하기 위한 지연
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * REVIEWS_PER_PAGE;
      const endIndex = startIndex + REVIEWS_PER_PAGE;
      const newReviews = reviews.slice(startIndex, endIndex);
      
      if (newReviews.length > 0) {
        setDisplayedReviews(prev => [...prev, ...newReviews]);
        setCurrentPage(nextPage);
        
        // 더 이상 로드할 리뷰가 없는지 확인
        if (endIndex >= reviews.length) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
    }, 500); // 로딩 시뮬레이션
  };

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      // 페이지 하단에 도달했는지 확인
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 100) {
        loadMoreReviews();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, isLoading, hasMore, reviews]);

  const filterOptions = ['전체', 'solo', 'couple', 'family', 'friend'];
  const sortOptions = ['최신순', '오래된순'];

  // 필터링된 리뷰 (표시된 리뷰 기준)
  const filteredReviews = displayedReviews.filter(review => {
    if (selectedFilter === '전체') return true;
    return review.companion === selectedFilter;
  });

  // 정렬된 리뷰
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortOrder === '최신순') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.location.href = '/'}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">후기 보기</h1>
            <div className="w-9" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* 사진 & 동영상 섹션 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">사진 & 동영상</h2>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {sortedReviews.map((review) => {
              // 첫 번째 동영상 파일만 가져오기
              const firstVideoFile = review.files.find(file => file.type === 'video');
              if (!firstVideoFile) return null;
              
              // Animated GIF URL 생성 (startTime=1, duration=7, fps=8)
              const animatedGifUrl = firstVideoFile.cloudflareId 
                ? `https://videodelivery.net/${firstVideoFile.cloudflareId}/thumbnails/thumbnail.gif?time=1s&duration=7s&fps=8`
                : firstVideoFile.localThumbnail || firstVideoFile.preview;
              
              return (
                <div 
                  key={review.id} 
                  className="flex-shrink-0 w-40 aspect-[9/16] relative bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => {
                    const videoIndex = review.files.findIndex(f => f.type === 'video');
                    openMediaViewer(review.files, videoIndex >= 0 ? videoIndex : 0);
                  }}
                >
                  <img 
                    src={animatedGifUrl}
                    alt="동영상 애니메이션 썸네일"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* 하단 텍스트 영역 */}
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    {/* 후기 내용 */}
                    {review.reviewText && (
                      <div className="text-white text-sm mb-2 line-clamp-3 leading-tight">
                        {review.reviewText}
                      </div>
                    )}
                    
                    {/* 날짜 */}
                    <div className="text-white text-sm font-medium opacity-90">
                      {getRelativeTime(review.createdAt)}
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean).slice(0, 10)}
          </div>
        </div>

        {/* 필터 & 정렬 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            최신순 • 추천순
          </div>
        </div>

        {/* 리뷰 리스트 */}
        <div className="space-y-6">
          {sortedReviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldShowToggle = isTextLongerThan3Lines(review.reviewText);
            
            return (
              <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex gap-4">
                  {/* 좌측: 아바타 + 사용자 정보 */}
                  <div className="flex-shrink-0 w-48">
                    <div className="flex items-start gap-3">
                      {/* 아바타 */}
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {review.authorInfo.name.charAt(0)}
                        </span>
                      </div>
                      
                      {/* 사용자 정보 */}
                      <div>
                        <div className="font-medium text-gray-900 mb-1">
                          {review.authorInfo.name.charAt(0)}***********
                        </div>
                        <div className="text-gray-500 text-sm">
                          {getAgeGroup(review.authorInfo.birthDate)} • {getCompanionText(review.companion)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 우측: 메인 콘텐츠 */}
                  <div className="flex-1">
                    {/* 행사명과 시간 */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        [미국환전일주] 미서부/미동부/캐나다 18일 (5대명절등+4대아정+7대캐넥+나이아가라2박숙박)
                      </div>
                      <div className="text-xs text-gray-500">
                        {getRelativeTime(review.createdAt)}
                      </div>
                    </div>

                    {/* 이미지/동영상 그리드 */}
                    {review.files.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {review.files.slice(0, 5).map((file, index) => (
                          <div 
                            key={index} 
                            className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openMediaViewer(review.files, index)}
                          >
                            {file.type === 'image' ? (
                              <img 
                                src={file.variants?.reviewThumb || file.cloudflareUrl || file.localThumbnail || file.preview} 
                                alt="리뷰 이미지"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <img 
                                src={file.cloudflareId ? `https://videodelivery.net/${file.cloudflareId}/thumbnails/thumbnail.jpg?time=1s` : file.localThumbnail || file.preview} 
                                alt="동영상 썸네일"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 리뷰 텍스트 */}
                    {review.reviewText && (
                      <div className="mb-4">
                        <p className={`text-gray-800 leading-relaxed text-sm ${
                          shouldShowToggle && !isExpanded ? 'line-clamp-3' : ''
                        }`}>
                          {review.reviewText}
                        </p>
                        
                        {shouldShowToggle && (
                          <button 
                            onClick={() => toggleExpanded(review.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 mt-2 font-medium"
                          >
                            {isExpanded ? '접기' : '더 많이 보기'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* 선택된 좋았던 점들 표시 - 더 많이 보기 버튼 아래에 항상 표시 */}
                    {review.guideEvaluations && Object.values(review.guideEvaluations).some(evaluation => evaluation.selectedKeywords && evaluation.selectedKeywords.length > 0) && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.values(review.guideEvaluations).map(evaluation => 
                            evaluation.selectedKeywords?.map(keywordId => {
                                // 키워드 라벨 가져오기
                                const keywordCategories = [
                                  {
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
                                
                                const keyword = keywordCategories
                                  .flatMap(category => category.keywords)
                                  .find(k => k.id === keywordId);
                                
                                if (!keyword) return null;
                                
                                return (
                                  <span 
                                    key={keywordId}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                  >
                                    <span>{keyword.emoji}</span>
                                    <span>{keyword.label}</span>
                                  </span>
                                );
                              })
                            ).filter(Boolean)}
                        </div>
                      </div>
                    )}

                    {/* 신고하기 버튼 */}
                    <div className="flex justify-end items-center">
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        신고하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        {/* 빈 상태 */}
        {reviews.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 작성된 후기가 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 번째 여행 후기를 작성해보세요!</p>
            <button 
              onClick={() => window.location.href = '/write'}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors"
            >
              후기 작성하기
            </button>
          </div>
        )}

        {/* 미디어 전체보기 모달 */}
        {selectedMedia && (
          <div 
            className="fixed inset-0 bg-black z-50 flex flex-col"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeMediaViewer();
              }
            }}
          >
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between p-6">
              <div></div>
              <div className="text-white text-lg font-medium">
                {currentMediaIndex + 1}/{selectedMedia.length}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeMediaViewer();
                }}
                className="text-white hover:text-gray-300 text-xl font-medium bg-black/50 hover:bg-black/70 px-4 py-2 rounded-lg transition-colors"
              >
                × 닫기
              </button>
            </div>

            {/* 메인 미디어 영역 */}
            <div className="flex-1 flex items-center justify-center p-4">
              {selectedMedia[currentMediaIndex] && (
                <div className="relative w-full h-full flex items-center justify-center">
                  {selectedMedia[currentMediaIndex].type === 'image' ? (
                    <img
                      src={selectedMedia[currentMediaIndex].variants?.reviewLarge || selectedMedia[currentMediaIndex].cloudflareUrl || selectedMedia[currentMediaIndex].localThumbnail || selectedMedia[currentMediaIndex].preview}
                      alt="전체보기 이미지"
                      className="object-contain"
                      style={{ 
                        maxHeight: '70vh',
                        maxWidth: '80vw',
                        minHeight: '400px',
                        minWidth: '300px'
                      }}
                    />
                  ) : (
                    <div className="relative">
                      {(() => {
                        // 다양한 Cloudflare Stream URL 형식 시도
                        const cloudflareId = selectedMedia[currentMediaIndex].cloudflareId;
                        let videoSrc = null;
                        
                        if (cloudflareId) {
                          // 기본 Stream URL (가장 일반적)
                          videoSrc = `https://videodelivery.net/${cloudflareId}`;
                        } else if (selectedMedia[currentMediaIndex].cloudflareUrl) {
                          videoSrc = selectedMedia[currentMediaIndex].cloudflareUrl;
                        }
                        
                        console.log('Video source:', videoSrc);
                        console.log('CloudflareId:', cloudflareId);
                        
                        if (!videoSrc && !cloudflareId) {
                          return (
                            <div 
                              className="flex items-center justify-center bg-gray-900 text-white"
                              style={{ 
                                maxHeight: '70vh',
                                maxWidth: '80vw',
                                minHeight: '400px',
                                minWidth: '300px'
                              }}
                            >
                              <div className="text-center">
                                <p className="mb-2">동영상을 재생할 수 없습니다</p>
                                <p className="text-sm text-gray-400">비디오 ID를 찾을 수 없습니다</p>
                              </div>
                            </div>
                          );
                        }
                        
                        // Cloudflare Stream iframe 사용 (기본 컨트롤 포함)
                        if (cloudflareId) {
                          return (
                            <div className="relative">
                              <iframe
                                key={`${selectedMedia[currentMediaIndex].id}-${currentMediaIndex}`}
                                src={`https://iframe.videodelivery.net/${cloudflareId}?autoplay=true&muted=true&loop=true&controls=true`}
                                className="object-contain bg-black"
                                style={{ 
                                  maxHeight: '70vh',
                                  maxWidth: '80vw',
                                  minHeight: '400px',
                                  minWidth: '300px',
                                  border: 'none'
                                }}
                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen={true}
                                onLoad={() => console.log('Video iframe loaded successfully')}
                                onError={(e) => console.error('Iframe error:', e)}
                              />
                            </div>
                          );
                        }
                        
                        // Fallback to regular video tag if no cloudflareId
                        return (
                          <video
                            key={`${selectedMedia[currentMediaIndex].id}-${currentMediaIndex}`}
                            src={videoSrc}
                            controls
                            autoPlay
                            className="object-contain bg-black"
                            style={{ 
                              maxHeight: '70vh',
                              maxWidth: '80vw',
                              minHeight: '400px',
                              minWidth: '300px'
                            }}
                            onError={(e) => {
                              console.error('Video playback error:', e);
                              console.log('Failed URL:', videoSrc);
                            }}
                            onLoadedData={() => console.log('Video loaded successfully')}
                          />
                        );
                      })()}
                    </div>
                  )}

                  {/* 좌우 네비게이션 */}
                  {selectedMedia.length > 1 && (
                    <>
                      {currentMediaIndex > 0 && (
                        <button
                          onClick={goToPrevMedia}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft size={24} className="text-white" />
                        </button>
                      )}
                      
                      {currentMediaIndex < selectedMedia.length - 1 && (
                        <button
                          onClick={goToNextMedia}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                        >
                          <ChevronRight size={24} className="text-white" />
                        </button>
                      )}
                    </>
                  )}

                </div>
              )}
            </div>

            {/* 하단 썸네일 */}
            <div className="p-6">
              <div className="flex gap-2 justify-center overflow-x-auto">
                {selectedMedia.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      index === currentMediaIndex 
                        ? 'border-white' 
                        : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={file.type === 'image' ? (file.variants?.standardThumbnail || file.cloudflareUrl || file.localThumbnail || file.preview) : (file.cloudflareId ? `https://videodelivery.net/${file.cloudflareId}/thumbnails/thumbnail.jpg?time=1s` : file.localThumbnail || file.preview)}
                      alt={`썸네일 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">더 많은 후기를 불러오는 중...</span>
          </div>
        )}
        
        {/* 더 이상 로드할 리뷰가 없을 때 */}
        {!hasMore && displayedReviews.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            모든 후기를 불러왔습니다
          </div>
        )}
        
        {/* 수동으로 더 보기 버튼 (옵션) */}
        {hasMore && !isLoading && displayedReviews.length > 0 && (
          <div className="flex justify-center py-4">
            <button
              onClick={loadMoreReviews}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              더 많은 후기 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;