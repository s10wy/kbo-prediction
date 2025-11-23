// src/app/api/cron/refresh-news/route.ts
// Vercel Cron Job이 매일 00시에 호출하는 엔드포인트

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  // Vercel Cron Job 인증 (보안)
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] 매일 자동 갱신 시작:', new Date().toISOString());

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    // 1. YouTube 데이터 갱신
    const youtubeRes = await fetch(`${baseUrl}/api/youtube?refresh=true&count=10`, {
      method: 'GET',
    });
    const youtubeData = await youtubeRes.json();
    console.log('[Cron] YouTube 갱신 완료:', youtubeData.count);

    // 2. News 데이터 갱신
    const newsRes = await fetch(`${baseUrl}/api/news?refresh=true&display=20`, {
      method: 'GET',
    });
    const newsData = await newsRes.json();
    console.log('[Cron] News 갱신 완료:', newsData.total);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      youtube: {
        count: youtubeData.count,
        cached: youtubeData.cached,
      },
      news: {
        total: newsData.total,
        cached: newsData.cached,
      },
    });
  } catch (error) {
    console.error('[Cron] 갱신 실패:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
