// web/components/DateSelector.tsx
"use client"; // 클라이언트 컴포넌트 (상호작용 필요)

import { useRouter, useSearchParams } from "next/navigation";

interface DateSelectorProps {
  dates: string[];     // 전체 날짜 목록
  currentDate: string; // 현재 선택된 날짜
}

export default function DateSelector({ dates, currentDate }: DateSelectorProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = e.target.value;
    // 날짜를 선택하면 URL을 변경 (예: /?date=2025-12-01)
    // 서버 컴포넌트인 page.tsx가 이를 감지하고 데이터를 다시 가져옵니다.
    router.push(`/?date=${selectedDate}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="date-select" className="text-sm font-medium text-gray-700">
        기준일 선택:
      </label>
      <select
        id="date-select"
        value={currentDate}
        onChange={handleChange}
        className="block w-40 rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm shadow-sm bg-white border"
      >
        {dates.map((date) => (
          <option key={date} value={date}>
            {date}
          </option>
        ))}
      </select>
    </div>
  );
}