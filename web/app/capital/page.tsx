// web/app/capital/page.tsx
import { getCapitalViewData, getAvailableDates } from "@/lib/data"; // 함수 변경
import DateSelector from "@/components/DateSelector";
import DashboardTemplate from "@/components/DashboardTemplate";
import React from "react";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function CapitalViewPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const queryDate = resolvedParams.date;

  const availableDates = await getAvailableDates();
  const currentDate = queryDate && availableDates.includes(queryDate) 
    ? queryDate 
    : availableDates[0];

  // 👇 수도권 데이터 가져오기
  const rawData = await getCapitalViewData(currentDate);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            부동산 지표 - 수도권뷰
          </h1>
          <DateSelector dates={availableDates} currentDate={currentDate} />
        </div>

        {(!rawData || rawData.length === 0) ? (
          <div className="p-10">데이터가 없습니다.</div>
        ) : (
          <DashboardTemplate rawData={rawData} currentDate={currentDate} />
        )}

      </div>
    </main>
  );
}