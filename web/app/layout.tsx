// web/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "부동산 대시보드",
  description: "부동산 데이터 시각화",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          
          {/* 👇 여기가 핵심 수정 포인트입니다! */}
          {/* md:ml-64 -> 데스크탑에서만 왼쪽 여백 줌 */}
          {/* pt-16 md:pt-0 -> 모바일에서는 헤더 높이만큼 띄움 */}
          <div className="flex-1 w-full md:ml-64 pt-16 md:pt-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}