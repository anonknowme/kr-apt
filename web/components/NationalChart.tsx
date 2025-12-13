// web/components/NationalChart.tsx
"use client";

import { BarChart, Card, Title, Text } from "@tremor/react";

interface NationalChartProps {
  data: any[];
  lastDate: string;
}

export default function NationalChart({ data, lastDate }: NationalChartProps) {
  const valueFormatter = (number: number) => 
    `${number > 0 ? '+' : ''}${number}%`;

  // 📊 데이터 개수에 따른 높이 계산 (모바일 가로형 차트용)
  // 데이터가 많으면(전국뷰 등) 차트 키를 키워서 스크롤 없이 시원하게 보여줍니다.
  // 기본 300px + 항목당 50px 추가
  const mobileHeight = data.length > 5 ? `${data.length * 50 + 200}px` : "h-80";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Title className="text-gray-900">변동률 차트</Title>
        <Text className="text-gray-500">기준일: {lastDate}</Text>
      </div>

      {/* 📱 1. 모바일 화면용 (가로형 차트) */}
      {/* md:hidden -> PC에서는 숨김 */}
      <div className="block md:hidden">
        <BarChart
          style={{ height: mobileHeight }} // 데이터 양에 맞춰 키가 늘어남
          data={data}
          index="regionName"
          categories={["매매", "전세"]}
          colors={["blue", "orange"]} 
          valueFormatter={valueFormatter}
          layout="horizontal" // 👈 [핵심] 차트를 90도 눕힘!
          showLegend={true}
          yAxisWidth={80} // 지역명(서울 강남권 등)이 들어갈 공간 넉넉하게 확보
          showAnimation={true}
        />
      </div>

      {/* 💻 2. PC 화면용 (세로형 차트) */}
      {/* hidden md:block -> 모바일에서는 숨김 */}
      <div className="hidden md:block w-full overflow-x-auto">
        <div className={data.length > 10 ? "min-w-[1000px]" : "w-full"}>
          <BarChart
            className="h-80 mt-6"
            data={data}
            index="regionName"
            categories={["매매", "전세"]}
            colors={["blue", "orange"]} 
            valueFormatter={valueFormatter}
            layout="vertical" // 기본 세로형
            yAxisWidth={48}
            showAnimation={true}
            showLegend={true}
          />
        </div>
      </div>
    </Card>
  );
}