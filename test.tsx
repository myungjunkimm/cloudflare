import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Upload, 
  Send, 
  Calendar, 
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
  Users
} from 'lucide-react';

const ReviewTemplate10 = () => {
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

  // 더미 데이터
  const [userData, setUserData] = useState({
    isMember: true,
    shareCount: 2,
    name: '김알파',
    dateOfBirth: '2000.01.01',
    isReview: false,
    members: {
      hasMember: true,
      memberList: [
        {
          memberName: '김브라보',
          reviewCompleted: false,
          dateOfBirth: '2000.02.01'
        },
        {
          memberName: '김찰리',
          reviewCompleted: false,
          dateOfBirth: '2000.02.03'
        }
      ]
    }
  });

  // 예약자 및 일행 정보 (더미 데이터)
  const validUsers = [
    { name: '김알파', dateOfBirth: '2000.01.01', isMember: false, isParent: true },   // 본인(예약자)
    { name: '김브라보', dateOfBirth: '2000.02.01', isMember: true, isParent: false }, // 일행 1
    { name: '김찰리', dateOfBirth: '2000.02.03', isMember: true, isParent: false }  // 일행 2
  ];

  // 상태 관리
  const [currentView, setCurrentView] = useState('initial'); // initial, form, completed
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showJsonBadge, setShowJsonBadge] = useState(false);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [publicConsent, setPublicConsent] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailType, setDetailType] = useState(''); // privacy, public, marketing
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedTestUser, setSelectedTestUser] = useState(''); // 선택된 테스트 사용자
  const [selectedGuideCount, setSelectedGuideCount] = useState(2); // 선택된 가이드 수

  // 월별 최대 일수 계산
  const getMaxDaysInMonth = (year, month) => {
    if (!year || !month) return 31;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    // 2월 처리 (윤년 체크)
    if (monthNum === 2) {
      const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
      return isLeapYear ? 29 : 28;
    }
    
    // 30일까지 있는 월
    if ([4, 6, 9, 11].includes(monthNum)) {
      return 30;
    }
    
    // 나머지는 31일
    return 31;
  };

  // 가이드 더미 데이터 - 기본값은 2명
  const [guides, setGuides] = useState([
    { id: 'guide1', name: '김가이드1' },
    { id: 'guide2', name: '김가이드2' }
  ]);

  // Form states
  const [selectedCompanion, setSelectedCompanion] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentGuideIndex, setCurrentGuideIndex] = useState(0);
  
  // 각 가이드별 평가 데이터
  const [guideEvaluations, setGuideEvaluations] = useState({
    guide1: {
      selectedKeywords: [],
      isGuideRecommended: false,
      npsScore: null
    },
    guide2: {
      selectedKeywords: [],
      isGuideRecommended: false,
      npsScore: null
    }
  });

  const [showCustomKeyword, setShowCustomKeyword] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  const [customKeywords, setCustomKeywords] = useState([]);

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

  // 리뷰 작성 시작
  const handleStartReview = () => {
    if (!userName || !birthDate) {
      alert('이름과 생년월일을 모두 입력해주세요.');
      return;
    }

    // 입력한 정보가 유효한지 확인
    const matchedUser = validUsers.find(user => 
      user.name === userName && user.dateOfBirth === birthDate
    );

    if (!matchedUser) {
      alert('예약 정보와 일치하지 않습니다. 이름과 생년월일을 다시 확인해주세요.');
      return;
    }

    // 일행 여부 확인
    if (matchedUser.isMember) {
      // 일행인 경우 - userData.members가 있는지 확인
      if (userData.members && userData.members.memberList) {
        const memberIndex = userData.members.memberList.findIndex(member => 
          member.memberName === matchedUser.name && member.dateOfBirth === matchedUser.dateOfBirth
        );
        
        if (memberIndex !== -1) {
          setSelectedMemberIndex(memberIndex);
          const member = userData.members.memberList[memberIndex];
          if (member.reviewCompleted) {
            alert('이미 리뷰를 작성하셨습니다.');
            return;
          }
        }
      } else {
        // 일행 데이터에 members 정보가 없는 경우 (간소화된 구조)
        if (userData.isReview) {
          alert('이미 리뷰를 작성하셨습니다.');
          return;
        }
        setSelectedMemberIndex(0); // 임시 인덱스
      }
    } else {
      // 본인인 경우
      if (userData.isReview) {
        setCurrentView('completed');
        return;
      }
    }
    
    setCurrentView('form');
  };

  // 공유하기 버튼 핸들러
  const handleShare = () => {
    // userData.members가 있는 경우에만 확인
    if (userData.members && userData.members.memberList) {
      const allReviewed = userData.members.memberList.every(member => member.reviewCompleted);
      
      if (allReviewed) {
        showToastMessage('모든 일행이 리뷰를 작성했습니다.');
        return;
      }
    }
    
    if (navigator.share) {
      navigator.share({
        title: '여행 리뷰 작성',
        text: '함께 즐거웠던 여행의 리뷰를 작성해주세요!',
        url: 'https://www.onlinetour.co.kr/review/m/reservationCheck?flag=tour&reservationNo=31773699'
      });
    } else {
      alert('공유하기 기능이 지원되지 않는 브라우저입니다.');
    }
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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = 3 - uploadedFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      alert(`최대 3개까지만 업로드할 수 있습니다. ${filesToAdd.length}개의 파일만 추가됩니다.`);
    }
    
    const filesWithPreview = filesToAdd.map(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      return {
        file,
        preview: isImage || isVideo ? URL.createObjectURL(file) : null,
        type: isImage ? 'image' : isVideo ? 'video' : 'other'
      };
    });
    
    setUploadedFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (index) => {
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 모든 가이드에 대해 키워드가 선택되었는지 확인
    const currentEvaluation = getCurrentEvaluation();
    if (currentEvaluation.selectedKeywords.length === 0) {
      alert(`${getCurrentGuide().name}에 대한 좋았던 점을 최소 1개 이상 선택해주세요.`);
      return;
    }
    
    // 다음 가이드가 있으면 다음으로 이동
    if (currentGuideIndex < guides.length - 1) {
      setCurrentGuideIndex(prev => prev + 1);
      return;
    }
    
    // 모든 가이드 평가가 완료되면 최종 제출
    setShowConsentModal(true);
  };

  const handleFinalSubmit = () => {
    if (!privacyConsent || !publicConsent) {
      alert('필수 항목에 모두 동의해주세요.');
      return;
    }
    
    // 휴대폰 번호 확인 - 일행인 경우에만 (isMember가 true인 경우)
    if (selectedMemberIndex !== null && selectedMemberIndex !== undefined && 
        userData.isMember) {
      if (!phoneNumber) {
        alert('일행의 경우 휴대폰 번호를 입력해주세요.');
        return;
      }
    }
    
    // 마케팅 동의하지 않은 경우 휴대폰 번호는 저장하지 않음
    const phoneToSave = marketingConsent ? phoneNumber : null;
    
    console.log('제출 데이터:', {
      companion: selectedCompanion,
      guideEvaluations,
      reviewText,
      files: uploadedFiles,
      privacyConsent,
      marketingConsent
    });
    
    // 일행 리뷰 작성 완료 처리
    if (selectedMemberIndex !== null && selectedMemberIndex !== undefined) {
      // userData.members가 있는 경우
      if (userData.members && userData.members.memberList) {
        const updatedUserData = { ...userData };
        updatedUserData.members.memberList[selectedMemberIndex].reviewCompleted = true;
        setUserData(updatedUserData);
      } else {
        // 간소화된 일행 구조인 경우
        setUserData(prev => ({ ...prev, isReview: true }));
      }
    } else {
      // 본인 리뷰 작성 완료 처리
      setUserData(prev => ({ ...prev, isReview: true }));
    }
    
    setShowConsentModal(false);
    showToastMessage('리뷰가 성공적으로 제출되었습니다!');
    
    setTimeout(() => {
      setCurrentView('completed');
    }, 1500);
  };

  // 초기 페이지
  if (currentView === 'initial') {
    return (
      <div 
        className="min-h-screen bg-gray-50"
        style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif' }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={24} className="text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">온라인투어 리뷰</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* 리뷰 등록 안내 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 mb-6 shadow-sm border border-blue-100">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">이번 여행 어떠셨나요?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                소중한 여행 리뷰를 나눠주세요! 🌟<br />
                다른 여행자들에게 큰 도움이 될 거예요
              </p>
            </div>
          </div>

          {/* 본인 정보 입력 */}
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 (한글명)
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={birthDate.split('.')[0] || ''}
                      onChange={(e) => {
                        const year = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                        const parts = birthDate.split('.');
                        setBirthDate(`${year}.${parts[1] || ''}.${parts[2] || ''}`);
                      }}
                      placeholder="2000"
                      maxLength="4"
                      className="w-full p-3 pr-8 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">년</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={birthDate.split('.')[1] || ''}
                      onChange={(e) => {
                        let month = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                        // 12 초과 방지
                        if (parseInt(month) > 12) {
                          month = '12';
                        }
                        const parts = birthDate.split('.');
                        setBirthDate(`${parts[0] || ''}.${month}.${parts[2] || ''}`);
                      }}
                      onBlur={(e) => {
                        // 포커스를 벗어날 때 1자리 숫자면 앞에 0 추가
                        let month = e.target.value;
                        if (month.length === 1 && parseInt(month) > 0) {
                          month = month.padStart(2, '0');
                        }
                        // 유효성 검사
                        if (parseInt(month) > 12) {
                          month = '12';
                        } else if (parseInt(month) < 1 && month !== '') {
                          month = '01';
                        }
                        const parts = birthDate.split('.');
                        setBirthDate(`${parts[0] || ''}.${month}.${parts[2] || ''}`);
                      }}
                      placeholder="01"
                      maxLength="2"
                      className="w-full p-3 pr-8 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">월</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={birthDate.split('.')[2] || ''}
                      onChange={(e) => {
                        let day = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                        const parts = birthDate.split('.');
                        const maxDays = getMaxDaysInMonth(parts[0], parts[1]);
                        
                        // 해당 월의 최대 일수 초과 방지
                        if (parseInt(day) > maxDays) {
                          day = maxDays.toString();
                        }
                        setBirthDate(`${parts[0] || ''}.${parts[1] || ''}.${day}`);
                      }}
                      onBlur={(e) => {
                        // 포커스를 벗어날 때 1자리 숫자면 앞에 0 추가
                        let day = e.target.value;
                        if (day.length === 1 && parseInt(day) > 0) {
                          day = day.padStart(2, '0');
                        }
                        
                        const parts = birthDate.split('.');
                        const maxDays = getMaxDaysInMonth(parts[0], parts[1]);
                        
                        // 유효성 검사
                        if (parseInt(day) > maxDays) {
                          day = maxDays.toString().padStart(2, '0');
                        } else if (parseInt(day) < 1 && day !== '') {
                          day = '01';
                        }
                        setBirthDate(`${parts[0] || ''}.${parts[1] || ''}.${day}`);
                      }}
                      placeholder="01"
                      maxLength="2"
                      className="w-full p-3 pr-8 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">일</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 리뷰 작성하기 버튼 */}
          <button
            onClick={handleStartReview}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors font-medium text-lg"
          >
            리뷰 작성하기
          </button>

          {/* 구분선 */}
          <div className="border-t border-gray-200 mt-8 mb-6"></div>

          {/* 테스트용 사용자 배지 */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">테스트용 바로가기</p>
              <button
                onClick={() => {
                  // localStorage 삭제
                  localStorage.clear();
                  // 세션스토리지 삭제
                  sessionStorage.clear();
                  // 상태 초기화
                  setUserName('');
                  setBirthDate('');
                  setPhoneNumber('');
                  setSelectedTestUser('');
                  setSelectedGuideCount(2);
                  setCurrentGuideIndex(0);
                  setSelectedCompanion('');
                  setReviewText('');
                  setUploadedFiles([]);
                  setGuideEvaluations({
                    guide1: {
                      selectedKeywords: [],
                      isGuideRecommended: false,
                      npsScore: null
                    },
                    guide2: {
                      selectedKeywords: [],
                      isGuideRecommended: false,
                      npsScore: null
                    }
                  });
                  setGuides([
                    { id: 'guide1', name: '김가이드1' },
                    { id: 'guide2', name: '김가이드2' }
                  ]);
                  setUserData({
                    isMember: true,
                    shareCount: 2,
                    name: '김알파',
                    dateOfBirth: '2000.01.01',
                    isReview: false,
                    members: {
                      hasMember: true,
                      memberList: [
                        {
                          memberName: '김브라보',
                          reviewCompleted: false,
                          dateOfBirth: '2000.02.01'
                        },
                        {
                          memberName: '김찰리',
                          reviewCompleted: false,
                          dateOfBirth: '2000.02.03'
                        }
                      ]
                    }
                  });
                  alert('히스토리 데이터가 삭제되었습니다.');
                }}
                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-md transition-colors"
              >
                히스토리 삭제
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setUserName('김알파');
                  setBirthDate('2000.01.01');
                  setSelectedTestUser('alpha-normal');
                  // 김알파(본인)의 관점에서 JSON 구조 - 일행만 memberList에 포함
                  setUserData({
                    isMember: false,
                    isParent: true,
                    shareCount: 2,
                    name: '김알파',
                    dateOfBirth: '2000.01.01',
                    isReview: false,
                    members: {
                      hasMember: true,
                      memberList: [
                        { memberName: '김브라보', reviewCompleted: false, dateOfBirth: '2000.02.01', isParent: false },
                        { memberName: '김찰리', reviewCompleted: false, dateOfBirth: '2000.02.03', isParent: false }
                      ]
                    }
                  });
                  setShowJsonBadge(true);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTestUser === 'alpha-normal' 
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-105' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                김알파 (본인)
              </button>
              <button
                onClick={() => {
                  setUserName('김알파');
                  setBirthDate('2000.01.01');
                  setSelectedTestUser('alpha-completed');
                  // 김알파(본인) 리뷰 완료 상태의 JSON 구조
                  setUserData({
                    isMember: false,
                    isParent: true,
                    shareCount: 2,
                    name: '김알파',
                    dateOfBirth: '2000.01.01',
                    isReview: true, // 리뷰 작성 완료
                    members: {
                      hasMember: true,
                      memberList: [
                        { memberName: '김브라보', reviewCompleted: false, dateOfBirth: '2000.02.01', isParent: false },
                        { memberName: '김찰리', reviewCompleted: false, dateOfBirth: '2000.02.03', isParent: false }
                      ]
                    }
                  });
                  setShowJsonBadge(true);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTestUser === 'alpha-completed' 
                    ? 'bg-green-500 text-white ring-2 ring-green-300 scale-105' 
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                김알파 (완료)
              </button>
              <button
                onClick={() => {
                  setUserName('김브라보');
                  setBirthDate('2000.02.01');
                  setSelectedTestUser('bravo-normal');
                  // 김브라보(일행)의 관점에서 JSON 구조 - 일행은 자신의 정보만
                  setUserData({
                    isMember: true,
                    isParent: false,
                    name: '김브라보',
                    dateOfBirth: '2000.02.01',
                    isReview: false
                  });
                  setShowJsonBadge(true);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTestUser === 'bravo-normal' 
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-105' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                김브라보 (일행)
              </button>
              <button
                onClick={() => {
                  setUserName('김브라보');
                  setBirthDate('2000.02.01');
                  setSelectedTestUser('bravo-completed');
                  // 김브라보(일행) 리뷰 완료 상태의 JSON 구조
                  setUserData({
                    isMember: true,
                    isParent: false,
                    name: '김브라보',
                    dateOfBirth: '2000.02.01',
                    isReview: true // 후기 작성 완료
                  });
                  setShowJsonBadge(true);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTestUser === 'bravo-completed' 
                    ? 'bg-green-500 text-white ring-2 ring-green-300 scale-105' 
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                김브라보 (완료)
              </button>
              <button
                onClick={() => {
                  setUserName('김찰리');
                  setBirthDate('2000.02.03');
                  setSelectedTestUser('charlie-normal');
                  // 김찰리(일행)의 관점에서 JSON 구조 - 일행은 자신의 정보만
                  setUserData({
                    isMember: true,
                    isParent: false,
                    name: '김찰리',
                    dateOfBirth: '2000.02.03',
                    isReview: false
                  });
                  setShowJsonBadge(true);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTestUser === 'charlie-normal' 
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-105' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                김찰리 (일행)
              </button>
              <button
                onClick={() => {
                  setUserName('김찰리');
                  setBirthDate('2000.02.03');
                  setSelectedTestUser('charlie-completed');
                  // 김찰리(일행) 리뷰 완료 상태의 JSON 구조
                  setUserData({
                    isMember: true,
                    isParent: false,
                    name: '김찰리',
                    dateOfBirth: '2000.02.03',
                    isReview: true // 후기 작성 완료
                  });
                  setShowJsonBadge(true);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTestUser === 'charlie-completed' 
                    ? 'bg-green-500 text-white ring-2 ring-green-300 scale-105' 
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                김찰리 (완료)
              </button>
            </div>
          </div>

          {/* 가이드 수 테스트용 배지 */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">가이드 수 테스트</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  // 가이드 1명 설정
                  setGuides([{ id: 'guide1', name: '김가이드1' }]);
                  setGuideEvaluations({
                    guide1: {
                      selectedKeywords: [],
                      isGuideRecommended: false,
                      npsScore: null
                    }
                  });
                  setCurrentGuideIndex(0);
                  setSelectedGuideCount(1);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedGuideCount === 1 
                    ? 'bg-orange-500 text-white ring-2 ring-orange-300 scale-105' 
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                }`}
              >
                가이드 1명
              </button>
              <button
                onClick={() => {
                  // 가이드 2명 설정 (기본값)
                  setGuides([
                    { id: 'guide1', name: '김가이드1' },
                    { id: 'guide2', name: '김가이드2' }
                  ]);
                  setGuideEvaluations({
                    guide1: {
                      selectedKeywords: [],
                      isGuideRecommended: false,
                      npsScore: null
                    },
                    guide2: {
                      selectedKeywords: [],
                      isGuideRecommended: false,
                      npsScore: null
                    }
                  });
                  setCurrentGuideIndex(0);
                  setSelectedGuideCount(2);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedGuideCount === 2 
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-105' 
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
              >
                가이드 2명
              </button>
            </div>
          </div>

          {/* JSON Badge - 배지 하위에 표시 */}
          {showJsonBadge && (
            <div className="mt-4 bg-gray-900 text-white rounded-2xl p-4 overflow-x-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">JSON 데이터 구조</span>
                <button
                  onClick={() => setShowJsonBadge(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <pre className="text-xs">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Toast Message */}
        {showToast && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg mr-4">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  // 리뷰 작성 완료 페이지
  if (currentView === 'completed') {
    return (
      <div 
        className="min-h-screen bg-gray-50"
        style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif' }}
      >
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentView('initial')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-lg font-medium text-gray-900">리뷰 작성 완료</h1>
              <div className="w-9" />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              리뷰 작성이 완료되었습니다!
            </h2>
            <p className="text-gray-600 mb-6">
              소중한 리뷰 감사합니다.
            </p>
            
            {/* isParent인 경우에만 공유하기 버튼 표시 (예약자만) */}
            {userData.isParent && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors font-medium"
              >
                <Share2 size={20} />
                일행에게 리뷰 링크 공유하기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 리뷰 작성 폼 (template 8 기반)
  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentView('initial')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">리뷰 작성</h1>
            <div className="flex items-center gap-2">
              {/* 공유하기 버튼 - userData.members가 있고 hasMember가 true인 경우에만 표시 */}
              {userData.members && userData.members.hasMember && (
                <button 
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Share2 size={20} className="text-gray-600" />
                </button>
              )}
            </div>
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

        {/* 여행 정보 */}
        <div className="bg-gray-50 rounded-3xl p-4 mb-6 border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-500">여행 기간</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">8박 9일</p>
              <p className="text-xs text-gray-600">2025.08.01~2025.08.09</p>
            </div>
            <div className="bg-white p-3 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-500">여행상품</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">해외패키지</p>
            </div>
            <div className="bg-white p-3 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Ticket size={16} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-500">예약번호</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">31773699</p>
            </div>
            <div className="bg-white p-3 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={16} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-500">행사번호</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">250705264424</p>
            </div>
          </div>
        </div>

        {/* 1. 동행인 선택 - 첫 번째 가이드일 때만 표시 */}
        {currentGuideIndex === 0 && (
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
        )}

        {/* 진행 상황 표시 - 가이드가 2명 이상일 때만 */}
        {guides.length > 1 && (
          <div className="bg-white rounded-3xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                {currentGuideIndex + 1} / {guides.length}
              </span>
            </div>
            <div className="flex gap-2">
              {guides.map((guide, index) => (
                <div key={guide.id} className="flex-1">
                  <div className={`h-2 rounded-full transition-all ${
                    index < currentGuideIndex ? 'bg-blue-600' :
                    index === currentGuideIndex ? 'bg-blue-500' : 'bg-gray-200'
                  }`} style={{
                    backgroundColor: index === currentGuideIndex ? '#3B82F6' : undefined
                  }}></div>
                  <button
                    onClick={() => setCurrentGuideIndex(index)}
                    className={`w-full text-xs mt-1 text-center transition-colors hover:text-blue-500 ${
                      index === currentGuideIndex ? 'text-blue-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {guide.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. 가이드별 키워드 선택 */}
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
                    disabled={showCustomKeyword || (!getCurrentEvaluation().selectedKeywords.includes(keyword.id) && getCurrentEvaluation().selectedKeywords.length >= 5)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      getCurrentEvaluation().selectedKeywords.includes(keyword.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : showCustomKeyword || getCurrentEvaluation().selectedKeywords.length >= 5
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

        {/* 휴대폰 번호 입력 - 일행인 경우 마지막 가이드일 때만 (isMember가 true인 경우) */}
        {selectedMemberIndex !== null && selectedMemberIndex !== undefined && 
         userData.isMember && currentGuideIndex === guides.length - 1 && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              휴대폰 번호
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
                
                // 010으로 시작하지 않으면 010을 자동으로 앞에 붙임
                if (value.length > 0 && !value.startsWith('010')) {
                  if (value.startsWith('10')) {
                    value = '0' + value;
                  } else if (!value.startsWith('0')) {
                    value = '010' + value;
                  }
                }
                
                // 최대 11자리까지만 허용
                if (value.length > 11) {
                  value = value.slice(0, 11);
                }
                
                // 010-xxxx-xxxx 형식으로 포맷팅
                if (value.length <= 3) {
                  // 010까지
                  setPhoneNumber(value);
                } else if (value.length <= 7) {
                  // 010-xxxx까지
                  setPhoneNumber(value.slice(0, 3) + '-' + value.slice(3));
                } else {
                  // 010-xxxx-xxxx 전체
                  setPhoneNumber(value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7));
                }
              }}
              placeholder="010-0000-0000"
              maxLength="13"
              className="w-full p-2.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-600 mt-2">
              * 마케팅 동의 시에만 휴대폰 번호가 저장됩니다.
            </p>
          </div>
        )}

        {/* 5. 리뷰 작성 - 마지막 가이드일 때만 표시 */}
        {currentGuideIndex === guides.length - 1 && (
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
        )}

        {/* 6. 파일 업로드 - 마지막 가이드일 때만 표시 */}
        {currentGuideIndex === guides.length - 1 && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900" style={{ fontWeight: 500 }}>이미지 & 동영상 업로드</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">선택</span>
            </div>
            <span className="text-sm text-gray-500">{uploadedFiles.length}/3</span>
          </div>
          
          {/* 업로드 버튼 - 3개 미만일 때만 표시 */}
          {uploadedFiles.length < 3 && (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-gray-400 transition-colors mb-4">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">파일 추가하기</p>
                <p className="text-xs text-gray-500 mt-1">이미지 및 동영상 (최대 3개)</p>
              </label>
            </div>
          )}
          
          {/* 프리뷰 그리드 */}
          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {uploadedFiles.map((fileObj, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    {fileObj.type === 'image' && fileObj.preview ? (
                      <img 
                        src={fileObj.preview} 
                        alt={fileObj.file.name}
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
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">{fileObj.file.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={getCurrentEvaluation().selectedKeywords.length === 0}
          className="w-full py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors font-medium text-lg disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
          style={{ fontWeight: 500 }}
        >
          {currentGuideIndex < guides.length - 1 ? 
            '다음' : 
            '리뷰 등록'
          }
        </button>

      </div>

      {/* 동의 모달 */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowConsentModal(false)}
          />
          
          {/* 모달 내용 - gnb 때문에 우측으로 약간 이동 */}
          <div className="relative bg-white w-full max-w-2xl rounded-t-3xl animate-slide-up mr-4">
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
                    <p>작성하신 게시물은 서비스의 '여행 후기', 'SNS채널(인스타그램, 페이스북)', '썸네일'의 상품 홍보, 마케팅 콘텐츠로 활용되어 불특정 다수에게 공개됩니다.</p>
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
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReviewTemplate10;