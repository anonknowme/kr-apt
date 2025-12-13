"use client";

import { BarChart, Card, Title, Text } from "@tremor/react";

interface NationalChartProps {
  data: any[];
  lastDate: string;
}

export default function NationalChart({ data, lastDate }: NationalChartProps) {
  const valueFormatter = (number: number) => 
    `${number > 0 ? '+' : ''}${number}%`;

  // 📊 데이터 개수에 따른 반응형 너비 설정 로직
  // 데이터가 10개가 넘어가면(전국뷰 등) -> 모바일에서 강제로 1000px을 확보해 스크롤을 유도
  // 데이터가 적으면(수도권뷰 등) -> 그냥 화면 너비(w-full)에 맞춤
  const isLargeData = data.length > 10;
  
  // md:w-full -> 데스크탑에서는 무조건 화면 꽉 차게
  // 모바일에서는 조건에 따라 min-w-[1000px] 또는 w-full 적용
  const containerClass = `md:w-full ${isLargeData ? "min-w-[1000px]" : "w-full"}`;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Title className="text-gray-900">
            {/* 제목도 데이터에 따라 동적으로 보여주면 좋지만, 일단 고정 */}
            변동률 차트
        </Title>
        <Text className="text-gray-500">기준일: {lastDate}</Text>
      </div>

      <div className="overflow-x-auto pb-4">
        {/* 👇 위에서 계산한 클래스를 여기에 적용 */}
        <div className={containerClass}>
          <BarChart
            className="h-80 mt-6"
            data={data}
            index="regionName"
            categories={["매매", "전세"]}
            colors={["blue", "orange"]} 
            yAxisWidth={48}
            valueFormatter={valueFormatter}
            showAnimation={true}
            showLegend={true}
          />
        </div>
      </div>
    </Card>
  );
}