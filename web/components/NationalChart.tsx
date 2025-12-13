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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Title className="text-gray-900">변동률 차트</Title>
        <Text className="text-gray-500">기준일: {lastDate}</Text>
      </div>

      {/* [CSS 트릭 유지]
        여전히 폰트 크기는 모바일에서 11px, PC에서 14px로 조절합니다. 
        그래야 작은 화면에서도 글자가 선명하게 보이니까요.
      */}
      <div className="w-full [&_.recharts-cartesian-axis-tick-value]:text-[11px] md:[&_.recharts-cartesian-axis-tick-value]:text-sm">
        <BarChart
          // 글자가 45도 기울어지면 세로 공간을 좀 먹기 때문에
          // 높이를 h-96 (384px) 정도로 고정하면 위아래 다 넉넉합니다.
          className="mt-6 h-96"
          
          data={data}
          index="regionName"
          categories={["매매", "전세"]}
          colors={["blue", "orange"]} 
          valueFormatter={valueFormatter}
          yAxisWidth={65}
          showAnimation={true}
          showLegend={true}
          
          // 👇 [핵심] 조건문 없이 무조건 -45도 회전!
          rotateLabelX={{ angle: -45 }}
        />
      </div>
    </Card>
  );
}