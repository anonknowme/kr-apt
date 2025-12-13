// web/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 이 함수를 호출하면 Supabase에 로그인된 상태의 연결 객체를 줍니다.
export const supabase = createClient(supabaseUrl, supabaseKey);