import { getIndividualViewData, getAvailableDates } from "@/lib/db";
import DateSelector from "@/components/DateSelector";
import DashboardTemplate from "@/components/DashboardTemplate";
import React from "react";

interface PageProps {
  params: Promise<{ regionName: string }>; // URL의 [regionName] 부분
  searchParams: Promise<{ date?: string }>;
}

export default async function IndividualViewPage({ params, searchParams }: PageProps) {
  // 1. URL 파라미터 해석 (예: /view/서울%20강남권 -> regionName="서울 강남권")
  const resolvedParams = await params;
  const regionName = decodeURIComponent(resolvedParams.regionName);

  const resolvedSearchParams = await searchParams;
  const queryDate = resolvedSearchParams.date;

  // 2. 날짜 설정
  const availableDates = await getAvailableDates();
  const currentDate = queryDate && availableDates.includes(queryDate) 
    ? queryDate 
    : availableDates[0];

  // 3. 해당 지역 그룹 데이터 가져오기
  const rawData = await getIndividualViewData(regionName, currentDate);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {/* 지역명을 제목으로 표시 */}
            {regionName}
          </h1>
          <DateSelector dates={availableDates} currentDate={currentDate} />
        </div>

        {(!rawData || rawData.length === 0) ? (
          <div className="p-10">
            <p className="font-bold text-red-500">데이터를 찾을 수 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">
              '{regionName}' 그룹이 DB의 region_mapping 테이블에 존재하는지 확인해주세요.
            </p>
          </div>
        ) : (
          <DashboardTemplate rawData={rawData} currentDate={currentDate} />
        )}

      </div>
    </main>
  );
}