import { getNationalViewData } from "@/lib/data";
import NationalChart from "@/components/NationalChart"; // 👈 분리한 컴포넌트 import
import React from "react"; // Fragment 사용을 위해 추가

// 데이터 가공을 위한 타입 정의
type ChartDataPoint = {
  regionName: string;
  "매매": number;
  "전세": number;
  order: number;
};

export default async function NationalViewPage() {
  // 1. 데이터 가져오기 (최근 8주치)
  const rawData = await getNationalViewData();

  if (!rawData || rawData.length === 0) {
    return <div className="p-10">데이터가 없습니다. DB를 확인해주세요.</div>;
  }

  // ---------------------------------------------------------
  // [로직 1] 차트용 데이터 가공 (최근 4주 누적 합산)
  // ---------------------------------------------------------
  const distinctDates = Array.from(new Set(rawData.map(d => d.date))).sort().reverse();
  const recent4Weeks = distinctDates.slice(0, 4);
  const recent8Weeks = distinctDates.slice(0, 8);

  const chartSourceData = rawData.filter(d => recent4Weeks.includes(d.date));
  const chartMap = new Map<string, ChartDataPoint>();

  chartSourceData.forEach((item) => {
    const name = item.region_mapping.display_name;
    const current = chartMap.get(name) || { 
      regionName: name, 
      "매매": 0, 
      "전세": 0,
      order: item.region_mapping.view_order 
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


  // ... (이전 코드들)
  
  // ---------------------------------------------------------
  // [로직 2] 테이블용 데이터 가공
  // ---------------------------------------------------------
  const regionList = chartData.map(d => d.regionName);
  
  // [수정] recent8Weeks는 [최신, ..., 과거] 순서입니다.
  // 이를 [...recent8Weeks].reverse() 하여 [과거, ..., 최신] 순으로 바꿉니다.
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

  // ... (이후 코드들)

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
        
        {/* 1. 상단 차트 영역 (클라이언트 컴포넌트로 교체) */}
        <NationalChart data={chartData} lastDate={distinctDates[0]} />

        {/* 2. 하단 테이블 영역 */}
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
                      /* React.Fragment에 key를 줘서 경고 해결 */
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