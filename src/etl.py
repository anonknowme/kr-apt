import os
import json
import requests
import urllib.parse
import pandas as pd
import gspread
from io import BytesIO
from datetime import datetime
from functools import reduce
from gspread_dataframe import get_as_dataframe
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. 환경변수 및 Supabase 연결 설정
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ .env 파일에 Supabase 설정이 없습니다.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -----------------------------------------------------------
# [Step 1] 구글 시트 -> Supabase 매핑 테이블 동기화 (전체 동기화)
# -----------------------------------------------------------
def sync_region_mapping():
    print("\n[Step 1] 구글 시트 매핑 테이블 동기화 중...")
    
    if not os.path.exists('credentials.json'):
        print("❌ 'credentials.json' 파일이 없습니다. (매핑 동기화 실패)")
        return pd.DataFrame()

    try:
        # 구글 시트 연결
        gc = gspread.service_account(filename='credentials.json')
        sh = gc.open("KB부동산")
        worksheet = sh.worksheet('지역맵핑')
        
        # 데이터프레임으로 변환
        df = get_as_dataframe(worksheet, usecols=range(10)).dropna(axis=0, how='all')
        df = df[df['지역'].notna()] # Key가 없는 행 제거
        
        # [수정] 데이터가 완벽하다고 가정하므로 별도 중복 제거 로직 삭제

        # Supabase 업로드용 리스트 생성
        records = []
        for _, row in df.iterrows():
            # NaN(빈값)을 None(NULL)으로 변환
            row = row.where(pd.notnull(row), None)
            
            record = {
                "kb_region_id": str(row['지역']),
                "division_1": row['지역구분1'],
                "division_2": row['지역구분2'],
                "division_3": row['지역구분3'],
                "display_name": row['지역명'],
                "view_nation": row['전국뷰'],
                "view_capital": row['수도권뷰'],
                "view_individual": row['개별뷰'],
                "view_group_name": row['개별뷰상세'],
                "view_order": row['개별뷰내순서']
            }
            records.append(record)
            
        # [전체 동기화 핵심] upsert를 사용하므로 시트의 전체 데이터를 DB에 반영합니다.
        # - 이미 있는 지역(Key) -> 정보 업데이트 (예: 그룹명 변경 반영)
        # - 없는 지역 -> 신규 추가
        supabase.table("region_mapping").upsert(records).execute()
        print(f"✅ 매핑 테이블 동기화 완료 ({len(records)}개 지역)")
        
        return df.set_index('지역')
        
    except Exception as e:
        print(f"❌ 매핑 동기화 실패: {e}")
        return pd.DataFrame()

# -----------------------------------------------------------
# [Step 2] KB 엑셀 다운로드 및 파싱
# -----------------------------------------------------------
def download_kb_excel():
    print("\n[Step 2] KB 엑셀 파일 다운로드 중...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    end_date = datetime.today().strftime('%Y-%m-%d')
    params_ref = {
        '주월간구분': '0',
        '기준년월시작일': '2008-01-01',
        '기준년월종료일': end_date
    }
    
    try:
        url_ref = 'https://api.kbland.kr/land-extra/statistics/reference?' + urllib.parse.urlencode(params_ref)
        res = requests.get(url_ref, headers=headers)
        data = res.json()
        
        if not data['dataBody']['data']['시계열']:
            return None
            
        filename = data['dataBody']['data']['시계열'][0]['파일명']
        filename_kor = data['dataBody']['data']['시계열'][0]['원본파일명']
        print(f"   타겟 파일명: {filename_kor}")
        
        params_file = {
            'urlpath': f'/kbstar/land/statc/tmsr/weekly/{filename}',
            'filename': filename_kor,
        }
        url_down = 'https://api.kbland.kr/land-extra/statistics/getfiledown'
        resp = requests.get(url_down, params=params_file, headers=headers)
        return pd.ExcelFile(BytesIO(resp.content))
        
    except Exception as e:
        print(f"❌ 다운로드 실패: {e}")
        return None

def process_sheet(excel, sheet_name, value_col_name, **kwargs):
    try:
        df = excel.parse(sheet_name, **kwargs)
    except:
        return pd.DataFrame()

    # 날짜 컬럼 처리
    if '구분' in df.columns:
        df = df.rename(columns={'구분': 'date'})
    elif len(df.columns) > 0:
        df.columns.values[0] = 'date'
        df = df.rename(columns={df.columns[0]: 'date'})

    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])

    # Wide -> Long 변환
    df_melted = df.melt(id_vars=['date'], var_name='kb_region_id', value_name=value_col_name)
    df_melted[value_col_name] = pd.to_numeric(df_melted[value_col_name], errors='coerce')
    
    return df_melted

def clean_kb_data(df):
    # 오타 수정
    replacements = {'강원특별자치도도': '강원특별자치도'}
    df['kb_region_id'] = df['kb_region_id'].replace(replacements)
    df['kb_region_id'] = df['kb_region_id'].str.strip()
    return df

# -----------------------------------------------------------
# [Step 3] Supabase 적재 로직 (스마트 필터링 & 증분 업데이트)
# -----------------------------------------------------------
def get_latest_date_from_db():
    """DB에서 가장 최근 데이터 날짜를 조회"""
    try:
        response = supabase.table('real_estate_stats') \
            .select('date') \
            .order('date', desc=True) \
            .limit(1) \
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]['date']
    except Exception as e:
        print(f"⚠️ 최신 날짜 조회 실패: {e}")
    
    return None

def upload_stats_to_supabase(df):
    print(f"\n[Step 3] Supabase 업로드 시작 (대상: {len(df)}행)...")
    
    # 1000개씩 끊어서 업로드 (Batch Insert)
    records = []
    for _, row in df.iterrows():
        record = {
            "date": row['date'].strftime('%Y-%m-%d'),
            "kb_region_id": str(row['kb_region_id']),
            "sale_index": row['sale_index'],
            "jeonse_index": row['jeonse_index'],
            "sale_change": row['sale_change'],
            "jeonse_change": row['jeonse_change']
        }
        # NaN 처리
        for k, v in record.items():
            if pd.isna(v): record[k] = None
        records.append(record)

    batch_size = 1000
    total_batches = (len(records) + batch_size - 1) // batch_size
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            # 🚨 [증분 업데이트 핵심] on_conflict 사용
            # 날짜와 지역이 겹치면 에러 대신 Update를 수행하여 중복 방지
            supabase.table("real_estate_stats").upsert(
                batch, 
                on_conflict="date, kb_region_id"
            ).execute()
            print(f"   Uploading batch {i//batch_size + 1}/{total_batches} ... OK")
        except Exception as e:
            print(f"❌ Batch {i//batch_size + 1} 업로드 실패: {e}")

# -----------------------------------------------------------
# 메인 실행 함수
# -----------------------------------------------------------
def main():
    # 1. 매핑 테이블 동기화 (전체 동기화 수행)
    df_mapping = sync_region_mapping()
    if df_mapping.empty:
        print("❌ 작업을 중단합니다.")
        return

    # 2. 엑셀 다운로드
    excel_file = download_kb_excel()
    if not excel_file: return

    # 3. 데이터 파싱
    print("   데이터 가공 중...")
    df_sale_idx = process_sheet(excel_file, '3.매매지수', 'sale_index', skiprows=[0, 2], header=[0])
    df_jeonse_idx = process_sheet(excel_file, '4.전세지수', 'jeonse_index', skiprows=[0, 2], header=[0])
    df_sale_chg = process_sheet(excel_file, '1.매매증감', 'sale_change', skiprows=[0, 2], skipfooter=9, header=[0])
    df_jeonse_chg = process_sheet(excel_file, '2.전세증감', 'jeonse_change', skiprows=[0, 2], header=[0])

    dfs = [df_sale_idx, df_jeonse_idx, df_sale_chg, df_jeonse_chg]
    df_final = reduce(lambda left, right: pd.merge(left, right, on=['date', 'kb_region_id'], how='outer'), dfs)
    
    # 데이터 정제 (이름 통일)
    df_final = clean_kb_data(df_final)

    # 🚨 [중요] KB 데이터 자체 중복 통합 (오타 등으로 인한 중복 행 합치기)
    print("   중복 데이터 병합 중...")
    df_final = df_final.groupby(['date', 'kb_region_id'], as_index=False).max()

    # 4. 날짜 필터링 (Python 레벨 필터링)
    # DB에 이미 있는 데이터는 제외하고 '새로운 날짜' 데이터만 남깁니다.
    last_db_date_str = get_latest_date_from_db()
    
    if last_db_date_str:
        print(f"\n🔍 DB 최신 데이터 날짜: {last_db_date_str}")
        last_date = pd.to_datetime(last_db_date_str)
        
        # DB 날짜보다 '미래'인 데이터만 필터링
        original_count = len(df_final)
        df_final = df_final[df_final['date'] > last_date]
        
        print(f"   -> 업데이트 대상: {len(df_final)}행 (전체 {original_count}행 중)")
    else:
        print("\n🔍 Full Load: DB가 비어있으므로 전체 데이터를 적재합니다.")

    if df_final.empty:
        print("✅ 업데이트할 데이터가 없습니다. 이미 최신 상태입니다.")
        return

    # 5. 매핑된 지역만 추출 (Inner Join)
    df_upload_target = pd.merge(
        left=df_final,
        right=df_mapping,
        left_on='kb_region_id',
        right_index=True,
        how='inner'
    )
    
    # 6. 업로드 실행
    if not df_upload_target.empty:
        upload_stats_to_supabase(df_upload_target)
        print("\n🎉 모든 작업이 성공적으로 완료되었습니다!")
    else:
        print("⚠️ 매핑 테이블과 일치하는 지역 데이터가 없습니다.")

if __name__ == "__main__":
    main()