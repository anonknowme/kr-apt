// web/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "전국뷰", path: "/" },
  { name: "수도권뷰", path: "/capital" },
  // 나중에 '개별뷰'도 여기에 추가하면 됩니다.
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-extrabold text-blue-600">KB Dashboard</h1>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          // 현재 페이지인지 확인 (활성화 표시)
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
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
    </aside>
  );
}