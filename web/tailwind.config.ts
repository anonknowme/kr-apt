// web/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // 다크모드 수동 제어 (시스템 설정 무시)
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 여기에 복잡한 tremor 설정은 다 뺐습니다. (기본값 사용)
    },
  },
  // [핵심] 우리가 쓰는 색상 클래스를 직접 명시해서 절대 지워지지 않게 합니다.
  safelist: [
    // 차트 색상 (파랑, 오렌지)
    "bg-blue-500", "fill-blue-500", "text-blue-500", "stroke-blue-500",
    "bg-orange-500", "fill-orange-500", "text-orange-500", "stroke-orange-500",
    
    // 표 텍스트 색상 (빨강, 파랑)
    "text-red-600", "text-blue-600",
    
    // 표 배경 색상 (히트맵 단계별)
    "bg-red-50", "bg-red-100", "bg-red-200", "bg-red-300",
    "bg-blue-50", "bg-blue-100", "bg-blue-200", "bg-blue-300",
    "bg-gray-50", "text-gray-300"
  ],
  plugins: [],
};

export default config;