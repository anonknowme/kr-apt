// web/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// web/components/Sidebar.tsx

const menuItems = [
    // 1. 메인 뷰
    { name: "수도권뷰", path: "/" },
    { name: "전국뷰", path: "/national" },
  
    // 2. 서울 (핵심 권역별 상세 구분)
    { name: "서울 강남권", path: "/view/서울 강남권" },
    { name: "서울 강남 서부권", path: "/view/서울 강남 서부권" },
    { name: "서울 마용성광", path: "/view/서울 마용성광" },
    { name: "서울 노도강", path: "/view/서울 노도강" },
    { name: "서울 기타 강북권", path: "/view/서울 기타 강북권" },
  
    // 3. 경기 (권역별 상세 구분)
    { name: "경기 남부", path: "/view/경기 남부" },     // 과천, 안양 등
    { name: "경기 동남부1", path: "/view/경기 동남부1" }, // 성남, 용인
    { name: "경기 동남부2", path: "/view/경기 동남부2" }, // 수원, 화성
    { name: "경기 남서부", path: "/view/경기 남서부" },   // 광명, 부천 등
    { name: "경기 북부", path: "/view/경기 북부" },       // 고양, 파주 등
    { name: "경기 동부", path: "/view/경기 동부" },       // 하남, 남양주 등
    { name: "경기 최남부", path: "/view/경기 최남부" },   // 평택, 안성 등
  
    // 4. 인천
    { name: "인천", path: "/view/인천" },
  ];
  
  // ... (아래 Sidebar 컴포넌트 코드는 그대로 유지)

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // 모바일 메뉴 열림 상태

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // 공통 메뉴 리스트 컴포넌트
  const MenuList = () => (
    <nav className="p-4 space-y-1">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={closeMenu} // 모바일에서 클릭 시 메뉴 닫기
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 1. 모바일 상단 헤더 (모바일에서만 보임) */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <h1 className="text-lg font-bold text-blue-600">부동산 대시보드</h1>
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          {/* 햄버거 아이콘 SVG */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 2. 데스크탑 사이드바 (md 이상에서만 보임, 항상 고정) */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 overflow-y-auto z-30">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-extrabold text-blue-600">부동산 대시보드</h1>
        </div>
        <MenuList />
      </aside>

      {/* 3. 모바일 사이드바 드로어 (isOpen일 때만 보임) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* 배경 어둡게 (클릭 시 닫힘) */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={closeMenu}
          />
          
          {/* 슬라이드 메뉴 */}
          <aside className="relative w-64 bg-white h-full shadow-xl animate-slide-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h1 className="text-xl font-extrabold text-blue-600">메뉴</h1>
              <button onClick={closeMenu} className="text-gray-500">
                ✕
              </button>
            </div>
            <MenuList />
          </aside>
        </div>
      )}
    </>
  );
}