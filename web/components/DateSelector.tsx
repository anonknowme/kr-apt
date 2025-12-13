"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation"; // usePathname 추가

interface DateSelectorProps {
  dates: string[];
  currentDate: string;
}

export default function DateSelector({ dates, currentDate }: DateSelectorProps) {
  const router = useRouter();
  const pathname = usePathname(); // 현재 페이지 경로 (예: /, /capital)
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = e.target.value;
    
    // 현재 페이지 경로(pathname)를 유지하면서 쿼리 스트링만 교체
    // 예: /capital?date=2024-11-25
    const params = new URLSearchParams(searchParams);
    params.set("date", selectedDate);
    
    router.push(`${pathname}?${params.toString()}`);
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