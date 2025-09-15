# 후기 플랫폼

Next.js와 shadcn/ui를 사용하여 구현된 후기 작성 및 공유 플랫폼입니다. Cloudflare Images와 Stream을 활용한 미디어 업로드를 지원합니다.

## 주요 기능

### 1. 후기 작성
- 작성자명, 후기 내용 입력
- 최대 5개 파일 업로드 (각 파일당 200MB 제한)
- 이미지: Cloudflare Images 사용 (자동 WebP 변환)
- 동영상: Cloudflare Stream 사용 (GIF 썸네일 생성)
- 첫 번째 업로드 파일 자동 대표 설정
- 파일 삭제 및 재업로드 기능

### 2. 후기 보기 (PDP)
- 상단: 9:16 비율 동영상 카드 (작성자별 첫 동영상)
- 하단: 후기 리스트 (텍스트 + 이미지/동영상 캐러셀)
- 동영상 카드 클릭 시 해당 후기로 스크롤

### 3. 데이터 저장
- 로컬 스토리지 기반 데이터 저장
- 실시간 업데이트 (같은 탭 내)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## Cloudflare 설정

1. **설정 페이지** (`/settings`)에서 다음 정보 입력:
   - **API Key**: Cloudflare API 토큰
   - **Account ID**: Cloudflare 계정 ID
   - **Account Hash**: Cloudflare Images 전용 해시

2. API Key 권한 요구사항:
   - `Cloudflare Images:Edit`
   - `Cloudflare Stream:Edit`

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **미디어 처리**: Cloudflare Images, Cloudflare Stream
- **데이터 저장**: Local Storage
- **언어**: TypeScript

## 프로젝트 구조

```
src/
├── app/                    # 페이지 및 API 라우트
│   ├── api/upload/        # Cloudflare 업로드 API
│   ├── write/             # 후기 작성 페이지
│   ├── settings/          # 설정 페이지
│   └── page.tsx           # 메인 페이지 (PDP)
├── components/            # 재사용 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── FileUpload.tsx    # 파일 업로드 컴포넌트
│   ├── ReviewForm.tsx    # 후기 작성 폼
│   ├── ReviewPDP.tsx     # PDP 메인 컴포넌트
│   ├── VideoCard.tsx     # 동영상 카드
│   ├── MediaCarousel.tsx # 미디어 캐러셀
│   └── ReviewList.tsx    # 후기 리스트
├── lib/                   # 유틸리티
│   ├── cloudflare.ts     # Cloudflare API 연동
│   └── storage.ts        # 로컬 스토리지 관리
└── types/                 # 타입 정의
    └── review.ts
```

## 사용 방법

1. **Cloudflare 설정**: `/settings` 페이지에서 API 정보 입력
2. **후기 작성**: `/write` 페이지에서 후기 작성 및 파일 업로드
3. **후기 보기**: 메인 페이지(`/`)에서 모든 후기 확인

## API 엔드포인트

- `POST /api/upload/image` - 이미지 업로드
- `POST /api/upload/video` - 동영상 업로드
# cloudflare
