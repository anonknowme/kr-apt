// web/components/DateSelector.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface DateSelectorProps {
  dates: string[];
  currentDate: string;
}

export default function DateSelector({ dates, currentDate }: DateSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 공통 날짜 이동 함수
  const moveDate = (targetDate: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", targetDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    moveDate(e.target.value);
  };

  // 🚀 [신규 기능] 타임머신 버튼 클릭 핸들러
  const handleQuickMove = (monthsToSubtract: number) => {
    if (!dates || dates.length === 0) return;

    // 1. 기준: 데이터 상 가장 최신 날짜 (dates[0])
    // (보통 '작년'이라고 하면 '지금으로부터 작년'을 의미하므로 최신 날짜를 기준으로 잡습니다)
    const latestDateStr = dates[0];
    const latestDate = new Date(latestDateStr);

    // 2. 목표 날짜 계산 (예: 오늘 - 12개월)
    const targetDate = new Date(latestDate);
    targetDate.setMonth(targetDate.getMonth() - monthsToSubtract);

    // 3. [핵심] DB에 있는 날짜 중 '목표 날짜'와 가장 가까운 날짜 찾기
    // (정확히 365일 전 데이터가 없을 수 있으므로, 가장 근접한 주차를 찾습니다)
    let closestDate = dates[0];
    let minDiff = Infinity;
    const targetTime = targetDate.getTime();

    dates.forEach((dateStr) => {
      const current = new Date(dateStr).getTime();
      const diff = Math.abs(current - targetTime);

      if (diff < minDiff) {
        minDiff = diff;
        closestDate = dateStr;
      }
    });

    // 4. 이동
    moveDate(closestDate);
  };

  // 버튼 설정 (라벨, 뺄 개월 수)
  const quickButtons = [
    { label: "1개월", months: 1 },
    { label: "3개월", months: 3 },
    { label: "6개월", months: 6 },
    { label: "1년", months: 12 },
    { label: "3년", months: 36 },
    { label: "5년", months: 60 },
    { label: "10년", months: 120 },
    { label: "15년", months: 180 },
  ];

  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-3">
      {/* 1. 기존 드롭다운 */}
      <div className="flex items-center gap-2">
        <label htmlFor="date-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          기준일:
        </label>
        <select
          id="date-select"
          value={currentDate}
          onChange={handleChange}
          className="block w-36 rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm shadow-sm bg-white border"
        >
          {dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 빠른 이동 버튼 그룹 */}
      <div className="flex flex-wrap gap-1.5">
        {quickButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleQuickMove(btn.months)}
            className="px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors whitespace-nowrap shadow-sm"
          >
            {btn.label} 전
          </button>
        ))}
      </div>
    </div>
  );
}