// web/lib/utils.ts

// 나중에는 이 함수가 DB에 접속하겠지만, 지금은 숫자 100을 줍니다.
export async function getTestNumber() {
    console.log("서버 터미널을 보세요: 데이터를 가져오는 중...");
    return 100;
  }