// src/app/api/news/route.ts
import { NextRequest, NextResponse } from 'next/server';

type NaverNewsItem = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
};

type CachedNews = {
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  isRecent: boolean;
};

// 캐시 저장
let cachedNews: CachedNews[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1시간

// HTML 태그 제거 및 특수문자 디코딩
function decodeHTML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// 1주일 이내 뉴스인지 확인
function isWithinOneWeek(pubDate: string): boolean {
  const newsDate = new Date(pubDate);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return newsDate >= oneWeekAgo;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || 'KBO야구';
  const display = searchParams.get('display') || '10';
  const forceRefresh = searchParams.get('refresh') === 'true';

  const client_id = process.env.NAVER_CLIENT_ID;
  const client_secret = process.env.NAVER_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return NextResponse.json({ 
      error: '네이버 API 인증 정보가 설정되지 않았습니다.' 
    }, { status: 500 });
  }

  // 캐시 확인
  const now = Date.now();
  if (!forceRefresh && cachedNews.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('[News] 캐시된 데이터 반환');
    const limit = parseInt(display, 10);
    return NextResponse.json({
      total: cachedNews.length,
      items: cachedNews.slice(0, limit),
      cached: true,
      cacheAge: Math.floor((now - lastFetchTime) / 1000 / 60),
    });
  }

  try {
    // 네이버 뉴스 API (최대 100개 가져와서 필터링)
    const api_url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=100&sort=date`;
    
    console.log('[News] API 호출 시작:', { query, display });
    
    const response = await fetch(api_url, {
      headers: {
        'X-Naver-Client-Id': client_id,
        'X-Naver-Client-Secret': client_secret,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[News] API 오류:', errorData);
      return NextResponse.json({ 
        error: '네이버 뉴스 API 오류 발생',
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    const items: NaverNewsItem[] = Array.isArray(data.items) ? data.items : [];

    // 1주일 이내 뉴스만 필터링 및 구조화
    const news: CachedNews[] = items
      .filter(item => isWithinOneWeek(item.pubDate))
      .map(item => ({
        title: decodeHTML(item.title),
        link: item.originallink || item.link,
        description: decodeHTML(item.description),
        publishedAt: item.pubDate,
        isRecent: true,
      }));

    // 캐시 업데이트
    cachedNews = news;
    lastFetchTime = now;

    console.log('[News] 새 데이터 페치 완료:', news.length);

    const limit = parseInt(display, 10);
    return NextResponse.json({
      total: news.length,
      items: news.slice(0, limit),
      cached: false,
    });
  } catch (err) {
    console.error('[News] 서버 오류:', err);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.',
      details: String(err)
    }, { status: 500 });
  }
}

// Cron Job용 강제 갱신 엔드포인트
export async function POST(req: NextRequest) {
  console.log('[News] Cron Job에 의한 강제 갱신 시작');
  
  const url = new URL(req.url);
  url.searchParams.set('refresh', 'true');
  url.searchParams.set('display', '20');
  
  return GET(new NextRequest(url));
}
