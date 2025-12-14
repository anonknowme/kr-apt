Project Name: KR-APT Dashboard (KB Real Estate Statistics Visualizer)

Overview Next.js와 Supabase를 활용하여 구축한 부동산 주간 통계 시각화 대시보드입니다. KB부동산의 시계열 데이터를 가공하여, 사용자가 지역별 매매/전세 증감률을 직관적으로 파악할 수 있도록 돕습니다.

Tech Stack

Framework: Next.js 14 (App Router)

Language: TypeScript

Database: Supabase (PostgreSQL)

Visualization: Tremor (React Chart Library)

Styling: Tailwind CSS

Deployment: Vercel

Key Features

Dynamic Routing: [regionName] 동적 라우팅을 통해 13개 세부 권역 데이터 페이지를 효율적으로 생성 및 관리.

Smart Date Navigation: 데이터가 존재하지 않는 과거 시점을 선택하더라도, 근사값 알고리즘을 통해 가장 가까운 날짜의 데이터를 자동으로 매핑.

Responsive UX: 데스크탑의 사이드바 구조와 모바일의 드로어(Drawer) 메뉴 및 가로 스크롤 차트를 통해 모든 디바이스에 최적화된 경험 제공.

Performance: Server Components(RSC)를 적극 활용하여 초기 로딩 속도 최적화 및 SEO 강화.