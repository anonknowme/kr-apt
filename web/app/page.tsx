import { getNationalViewData, getAvailableDates } from "@/lib/data";
import NationalChart from "@/components/NationalChart";
import DateSelector from "@/components/DateSelector";
import React from "react";

// [수정 1] searchParams의 타입을 Promise로 감싸야 합니다.
interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function NationalViewPage({ searchParams }: PageProps) {
  // [수정 2] searchParams를 먼저 await로 풀고 나서 사용해야 합니다.
  const resolvedParams = await searchParams;
  const queryDate = resolvedParams.date;

  // 2. 날짜 목록 가져오기 (드롭다운용)
  const availableDates = await getAvailableDates();
  
  // 3. 현재 기준일 결정
  const currentDate = queryDate && availableDates.includes(queryDate) 
    ? queryDate 
    : availableDates[0];

  // 4. 데이터 가져오기
  const rawData = await getNationalViewData(currentDate);

  // ... (이 아래 코드는 기존과 100% 동일합니다) ...
  if (!rawData || rawData.length === 0) {
    return <div className="p-10">데이터가 없습니다.</div>;
  }

  // --- 기존 로직 1 (차트 데이터 가공) ---
  const distinctDates = Array.from(new Set(rawData.map(d => d.date))).sort().reverse();
  const recent4Weeks = distinctDates.slice(0, 4);
  const recent8Weeks = distinctDates.slice(0, 8);

  const chartSourceData = rawData.filter(d => recent4Weeks.includes(d.date));
  
  const chartMap = new Map<string, any>();
  chartSourceData.forEach((item) => {
    const name = item.region_mapping.display_name;
    const current = chartMap.get(name) || { 
      regionName: name, "매매": 0, "전세": 0, order: item.region_mapping.view_order 
    };
    current["매매"] += item.sale_change;
    current["전세"] += item.jeonse_change;
    chartMap.set(name, current);
  });

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.order - b.order)
    .map(d => ({
      ...d,
      "매매": Number(d["매매"].toFixed(2)),
      "전세": Number(d["전세"].toFixed(2)),
    }));

  // --- 기존 로직 2 (테이블 데이터 가공) ---
  const regionList = chartData.map(d => d.regionName);
  const sortedWeeksForTable = [...recent8Weeks].reverse();

  const tableRows = sortedWeeksForTable.map(date => {
    const weekData = rawData.filter(d => d.date === date);
    return {
      date,
      regions: regionList.map(region => {
        const stat = weekData.find(d => d.region_mapping.display_name === region);
        return {
          sale: stat?.sale_change || 0,
          jeonse: stat?.jeonse_change || 0
        };
      })
    };
  });

  // UI 헬퍼 함수
  const getCellColor = (value: number, type: 'bg' | 'text') => {
    if (value === 0) return type === 'bg' ? 'bg-gray-50' : 'text-gray-300';
    const isPositive = value > 0;
    const absVal = Math.abs(value);
    if (type === 'text') return isPositive ? 'text-red-600' : 'text-blue-600';
    if (absVal >= 0.5) return isPositive ? 'bg-red-300' : 'bg-blue-300';
    if (absVal >= 0.3) return isPositive ? 'bg-red-200' : 'bg-blue-200';
    if (absVal >= 0.1) return isPositive ? 'bg-red-100' : 'bg-blue-100';
    return isPositive ? 'bg-red-50' : 'bg-blue-50';
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            부동산 지표 대시보드
          </h1>
          <DateSelector dates={availableDates} currentDate={currentDate} />
        </div>

        {/* 차트 영역 */}
        <NationalChart data={chartData} lastDate={currentDate} />

        {/* 테이블 영역 */}
        <div className="p-0 overflow-hidden bg-white rounded-lg shadow ring-1 ring-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th rowSpan={2} className="p-2 border-r border-gray-300 sticky left-0 bg-gray-100 z-10 w-24">
                    날짜
                  </th>
                  {regionList.map((region) => (
                    <th key={region} colSpan={2} className="p-2 border-r border-gray-300 font-bold text-gray-700 min-w-[80px]">
                      {region}
                    </th>
                  ))}
                </tr>
                <tr className="bg-gray-50 border-b border-gray-300">
                  {regionList.map((region) => (
                    <React.Fragment key={region}>
                      <th className="p-1 border-r border-gray-200 text-gray-500 font-normal">매매</th>
                      <th className="p-1 border-r border-gray-300 text-gray-500 font-normal">전세</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.date} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-2 font-mono text-gray-600 border-r border-gray-300 sticky left-0 bg-white z-10">
                      {row.date}
                    </td>
                    {row.regions.map((regionData, idx) => (
                      <React.Fragment key={`${row.date}-${idx}`}>
                        <td className={`p-2 border-r border-gray-100 ${getCellColor(regionData.sale, 'bg')} ${getCellColor(regionData.sale, 'text')}`}>
                          {regionData.sale.toFixed(2)}
                        </td>
                        <td className={`p-2 border-r border-gray-300 ${getCellColor(regionData.jeonse, 'bg')} ${getCellColor(regionData.jeonse, 'text')}`}>
                          {regionData.jeonse.toFixed(2)}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}