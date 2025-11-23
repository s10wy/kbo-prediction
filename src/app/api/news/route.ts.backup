// src/app/api/news/route.ts
//네이버 뉴스 검색 api
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const display = searchParams.get('display') ?? '10'; // 최대 뉴스개수

  // .env에 저장된 네이버 뉴스 API 인증정보 사용
  const client_id = process.env.NAVER_CLIENT_ID;
  const client_secret = process.env.NAVER_CLIENT_SECRET;

  if (!query) return NextResponse.json({ error: 'query 파라미터 필요' }, { status: 400 });

  try {
    // 네이버 뉴스 API 엔드포인트 예시
    const api_url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}`;
    const response = await fetch(api_url, {
      headers: {
        'X-Naver-Client-Id': client_id!,
        'X-Naver-Client-Secret': client_secret!,
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
