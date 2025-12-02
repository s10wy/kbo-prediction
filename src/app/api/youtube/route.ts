// src/app/api/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server';

type YoutubeSearchItem = {
  id: { kind: string; videoId?: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { 
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
};

type CachedVideo = {
  title: string;
  videoUrl: string;
  thumbnail: string;
  thumbnailHigh: string;
  channelName: string;
  publishedAt: string;
  description: string;
};

// 캐시 저장 (간단한 메모리 캐싱)
let cachedVideos: CachedVideo[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12시간

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || 'KBO highlights';
  const forceRefresh = searchParams.get('refresh') === 'true';

  // count 값 가져오되, 최대 50, 최소 1 제한
  let count = parseInt(searchParams.get('count') || '6', 10);
  if (isNaN(count) || count < 1) count = 1;
  if (count > 50) count = 50;

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API Key가 설정되지 않았습니다.' }, { status: 500 });
  }

  // 캐시 확인 (강제 새로고침이 아닌 경우)
  const now = Date.now();
  if (!forceRefresh && cachedVideos.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('[YouTube] 캐시된 데이터 반환');
    return NextResponse.json({
      count: Math.min(count, cachedVideos.length),
      videos: cachedVideos.slice(0, count),
      cached: true,
      cacheAge: Math.floor((now - lastFetchTime) / 1000 / 60), // 분 단위
    });
  }

  try {
    // 1주일 전 날짜 계산
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const publishedAfter = oneWeekAgo.toISOString();

    // 유튜브 검색 API 엔드포인트 (1주일 이내 + 최신순)
    const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${count}&q=${encodeURIComponent(query)}&key=${apiKey}&order=date&publishedAfter=${publishedAfter}`;
    
    console.log('[YouTube] API 호출 시작:', { query, count, publishedAfter });
    
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      console.error('[YouTube] API 오류:', data);
      return NextResponse.json({ 
        error: data.error?.message || 'YouTube API 오류 발생',
        details: data.error
      }, { status: response.status });
    }

    // 받을 데이터에서 영상 정보만 필터링 후 구조화
    const items: YoutubeSearchItem[] = Array.isArray(data.items) ? data.items : [];
    const videos: CachedVideo[] = items
      .filter(item => item.id?.kind === 'youtube#video' && item.id.videoId)
      .map(item => ({
        title: item.snippet.title,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.default.url,
        thumbnailHigh: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
        channelName: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
      }));

    // 캐시 업데이트
    cachedVideos = videos;
    lastFetchTime = now;

    console.log('[YouTube] 새 데이터 페치 완료:', videos.length);

    return NextResponse.json({
      count: videos.length,
      videos,
      cached: false,
    });
  } catch (err) {
    console.error('[YouTube] 서버 오류:', err);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.',
      details: String(err)
    }, { status: 500 });
  }
}

// Cron Job용 강제 갱신 엔드포인트
export async function POST(req: NextRequest) {
  console.log('[YouTube] Cron Job에 의한 강제 갱신 시작');
  
  // GET 요청을 강제 새로고침으로 호출
  const url = new URL(req.url);
  url.searchParams.set('refresh', 'true');
  url.searchParams.set('count', '10');
  
  return GET(new NextRequest(url));
}
