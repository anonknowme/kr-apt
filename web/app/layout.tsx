// web/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // 사이드바 import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "부동산 대시보드",
  description: "KB 부동산 데이터 시각화",
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
          {/* 사이드바 (왼쪽 고정) */}
          <Sidebar />
          
          {/* 메인 컨텐츠 (오른쪽, 사이드바 너비만큼 밀기) */}
          <div className="flex-1 ml-64">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}