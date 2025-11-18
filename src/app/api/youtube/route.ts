// src/app/api/youtube/route.ts
//유튜브 동영상 검색 api
import { NextRequest, NextResponse } from 'next/server';

type YoutubeSearchItem = {
  id: { kind: string; videoId?: string };
  snippet: { title: string; thumbnails: { default: { url: string } } };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  // count 값 가져오되, 최대 50, 최소 1 제한
  let count = parseInt(searchParams.get('count') || '5', 10);
  if (isNaN(count) || count < 1) count = 1;
  if (count > 50) count = 50; // 제한
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!query) return NextResponse.json({ error: 'query 파라미터 필요' }, { status: 400 });

  try {
    // 유튜브 검색 API 엔드포인트
    const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${count}&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await fetch(endpoint);
    const data = await response.json();

    // 받을 데이터에서 영상 정보만 필터링 후 구조화
    const items: YoutubeSearchItem[] = Array.isArray(data.items) ? data.items : [];
    const videos = items
      .filter(item => item.id?.kind === "youtube#video" && item.id.videoId)
      .map(item => ({
        title: item.snippet.title,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.default.url,
      }));

    // 프론트엔드는 videos 배열(title/videoUrl/thumbnail)로 화면 구성
    return NextResponse.json({ count: videos.length, videos });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
