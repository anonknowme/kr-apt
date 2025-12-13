// web/lib/data.ts
import { supabase } from './supabaseClient';

// 1. 데이터 타입 정의 (문서 기반)
// 나중에 차트 그릴 때 헷갈리지 않게 미리 모양을 잡아둡니다.
export interface RegionStat {
  kb_region_id: string;
  date: string;
  sale_change: number;
  jeonse_change: number;
  region_mapping: {
    display_name: string;
    view_group_name: string;
    view_order: number;
  };
}

// 2. 최신 날짜 가져오기 (기존 함수 유지)
export async function getLatestDate() {
  const { data, error } = await supabase
    .from('real_estate_stats')
    .select('date')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data?.date;
}

// 3. [핵심] 조인된 데이터 가져오기
// 문서의 "SQL 쿼리 예시"를 Supabase JS 코드로 구현했습니다.
export async function getChartDataByGroup(targetDate: string, groupName: string) {
  
  const { data, error } = await supabase
    .from('real_estate_stats') // 메인 테이블: 통계
    .select(`
      kb_region_id,
      date,
      sale_change,
      jeonse_change,
      region_mapping!inner ( 
        display_name,
        view_group_name,
        view_order
      )
    `)
    // 조건 1: 날짜 필터링
    .eq('date', targetDate)
    // 조건 2: 그룹 필터링 (조인된 테이블의 컬럼 이용)
    .eq('region_mapping.view_group_name', groupName)
    // 조건 3: 정렬 (조인된 테이블의 view_order 기준 오름차순)
    .order('view_order', { foreignTable: 'region_mapping', ascending: true });

  if (error) {
    console.error('데이터 조회 실패:', error);
    return [];
  }

  // Supabase가 반환한 데이터를 우리가 쓰기 편한 타입으로 변환해서 반환
  return data as unknown as RegionStat[];
}

// [신규] 전국뷰를 위한 데이터 조회 (최근 8주 데이터)
// web/lib/data.ts 수정

// ... 기존 import 및 인터페이스 유지 ...

// web/lib/data.ts 수정

// [수정] 드롭다운용 날짜 목록 가져오기 (성능 최적화)
export async function getAvailableDates() {
  // 팁: 모든 지역을 다 가져오지 말고, '전국' 데이터만 가져와서 날짜를 뽑습니다.
  // 그러면 1000개 limit으로도 약 19년치(1000주) 날짜를 모두 가져올 수 있습니다.
  const { data } = await supabase
    .from('real_estate_stats')
    .select(`
      date,
      region_mapping!inner(display_name)
    `)
    .eq('region_mapping.display_name', '전국') // 👈 '전국' 하나만 콕 집어서 조회
    .order('date', { ascending: false })
    .limit(2000); // 넉넉하게 2000개 (약 38년치) 설정
  
  if (!data) return [];
  
  // 날짜 목록 반환
  return data.map(d => d.date);
}

// [수정] 특정 날짜(anchorDate)를 기준으로 과거 8주 데이터 가져오기
export async function getNationalViewData(anchorDate?: string) {
  // 1. 전체 날짜 목록을 가져옴
  const allDates = await getAvailableDates();
  
  if (allDates.length === 0) return [];

  // 2. 기준 날짜 설정 (없으면 가장 최신 날짜)
  const targetDate = anchorDate || allDates[0];
  
  // 3. 기준 날짜가 전체 목록에서 몇 번째인지 찾음
  const startIndex = allDates.indexOf(targetDate);
  
  // 날짜가 목록에 없으면(예: 이상한 날짜 입력) 빈 배열 반환
  if (startIndex === -1) return [];

  // 4. 기준 날짜부터 과거 8개(8주) 날짜 추출
  // 예: startIndex가 2라면, index 2~9까지 8개를 자름
  const targetWeeks = allDates.slice(startIndex, startIndex + 8);

  if (targetWeeks.length === 0) return [];

  // 5. 해당 8주치 데이터 조회
  const { data, error } = await supabase
    .from('real_estate_stats')
    .select(`
      date,
      sale_change,
      jeonse_change,
      region_mapping!inner (
        display_name,
        view_order,
        view_nation
      )
    `)
    .in('date', targetWeeks)
    .eq('region_mapping.view_nation', 1)
    .order('date', { ascending: false })
    .order('view_order', { foreignTable: 'region_mapping', ascending: true });

  if (error) {
    console.error('전국뷰 데이터 조회 실패:', error);
    return [];
  }

  return data as unknown as RegionStat[];
}

// web/lib/data.ts (맨 아래에 추가)

// [신규] 수도권뷰 데이터 조회
export async function getCapitalViewData(anchorDate?: string) {
  const allDates = await getAvailableDates();
  
  if (allDates.length === 0) return [];

  const targetDate = anchorDate || allDates[0];
  const startIndex = allDates.indexOf(targetDate);
  
  if (startIndex === -1) return [];

  const targetWeeks = allDates.slice(startIndex, startIndex + 8);

  if (targetWeeks.length === 0) return [];

  const { data, error } = await supabase
    .from('real_estate_stats')
    .select(`
      date,
      sale_change,
      jeonse_change,
      region_mapping!inner (
        display_name,
        view_order,
        view_capital 
      )
    `)
    .in('date', targetWeeks)
    // 👇 여기가 핵심입니다! (view_nation 대신 view_capital 사용)
    .eq('region_mapping.view_capital', 1) 
    .order('date', { ascending: false })
    .order('view_order', { foreignTable: 'region_mapping', ascending: true });

  if (error) {
    console.error('수도권뷰 데이터 조회 실패:', error);
    return [];
  }

  return data as unknown as RegionStat[];
}

// web/lib/data.ts

// [신규] 개별뷰(특정 그룹) 데이터 조회
// 예: getIndividualViewData('서울 강남권', '2025-12-08')
export async function getIndividualViewData(groupName: string, anchorDate?: string) {
  const allDates = await getAvailableDates();
  
  if (allDates.length === 0) return [];

  const targetDate = anchorDate || allDates[0];
  const startIndex = allDates.indexOf(targetDate);
  
  if (startIndex === -1) return [];

  const targetWeeks = allDates.slice(startIndex, startIndex + 8);

  if (targetWeeks.length === 0) return [];

  // URL 디코딩 (혹시 URL에 %20 같은게 섞여 올 수 있으므로)
  const decodedGroupName = decodeURIComponent(groupName);

  const { data, error } = await supabase
    .from('real_estate_stats')
    .select(`
      date,
      sale_change,
      jeonse_change,
      region_mapping!inner (
        display_name,
        view_order,
        view_group_name 
      )
    `)
    .in('date', targetWeeks)
    // 👇 여기가 핵심! 그룹 이름으로 필터링
    .eq('region_mapping.view_group_name', decodedGroupName)
    .order('date', { ascending: false })
    .order('view_order', { foreignTable: 'region_mapping', ascending: true });

  if (error) {
    console.error(`${decodedGroupName} 데이터 조회 실패:`, error);
    return [];
  }

  return data as unknown as RegionStat[];
}