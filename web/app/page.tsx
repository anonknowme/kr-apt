// web/app/page.tsx
import { getLatestDate } from "@/lib/data"; // 이번엔 data.ts에서 가져옵니다

export default async function Home() {
  // 진짜 DB 데이터 가져오기
  const latestDate = await getLatestDate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-blue-600">
        Supabase 연동 성공!
      </h1>
      
      <div className="mt-8 p-6 border-2 border-blue-200 rounded-xl bg-blue-50">
        <p className="text-lg text-gray-600">DB에 저장된 가장 최근 데이터 날짜:</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {latestDate}
        </p>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        이 데이터는 Supabase의 'real_estate_data' 테이블에서 가져왔습니다.
      </p>
    </main>
  );
}