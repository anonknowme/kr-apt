"use client";

import { BarChart, Card, Title, Text } from "@tremor/react";

interface NationalChartProps {
  data: any[];
  lastDate: string;
}

export default function NationalChart({ data, lastDate }: NationalChartProps) {
  const valueFormatter = (number: number) => 
    `${number > 0 ? '+' : ''}${number}%`;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Title className="text-gray-900">전국뷰 - 최근 4주 누적 변동률</Title>
        <Text className="text-gray-500">기준일: {lastDate}</Text>
      </div>

      <BarChart
        className="h-80 mt-6"
        data={data}
        index="regionName"
        categories={["매매", "전세"]}
        // Tailwind Config의 Safelist에 있는 색상 사용
        colors={["blue", "orange"]} 
        yAxisWidth={48}
        valueFormatter={valueFormatter}
        showAnimation={true}
        // 툴팁 글자색 강제 지정 (혹시 모를 시인성 문제 방지)
        showLegend={true}
      />
    </Card>
  );
}