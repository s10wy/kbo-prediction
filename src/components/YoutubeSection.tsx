'use client';
import React, { useEffect, useState } from 'react';

// ===== 유틸리티 =====
function decodeEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/'/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ===== 타입 정의 =====
type VideoItem = {
  title: string;
  videoUrl: string;
  thumbnail: string;
  thumbnailMedium?: string;
  thumbnailHigh?: string;
  publishedAt: string;
  channelTitle: string;
  description: string;
};

type ApiResponse = {
  count: number;
  videos: VideoItem[];
  query: string;
  recentDays: number;
  timestamp: string;
  cached?: boolean;
  cacheAge?: number;
};

// ===== 메인 컴포넌트 =====
export default function YoutubeSection() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiInfo, setApiInfo] = useState<{
    cached: boolean;
    timestamp: string;
    cacheAge?: number;
  } | null>(null);

  // 데이터 가져오기
  const fetchVideos = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');

      const refreshParam = forceRefresh ? '&refresh=true' : '';
      const response = await fetch(
        `/api/youtube?query=KBO야구 하이라이트&count=6&recent=7${refreshParam}`
      );

      if (!response.ok) {
        throw new Error('YouTube API 호출 실패');
      }

      const data: ApiResponse = await response.json();

      setVideos(data.videos || []);
      setApiInfo({
        cached: data.cached || false,
        timestamp: data.timestamp,
        cacheAge: data.cacheAge,
      });
      setLoading(false);
    } catch (err) {
      console.error('[YoutubeSection] 오류:', err);
      setError('유튜브 영상을 불러올 수 없습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchVideos(true);
  };

  return (
    <section
      style={{
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      }}
    >
      {/* 헤더 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#333',
              margin: 0,
            }}
          >
            야구 유튜브 영상
          </h2>

          {/* 새로고침 버튼 */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading ? '#ccc' : '#FF0000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseOver={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
            }}
            onMouseOut={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            {loading ? '' : ''} {loading ? '불러오는 중...' : '새로고침'}
          </button>
        </div>

        <p style={{ color: '#666', fontSize: '0.95rem', opacity: 0.8, margin: 0 }}>
          KBO 야구의 최신 영상과 분석을 감상하세요
        </p>

        {/* 캐시 정보 */}
        {apiInfo && !loading && (
          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {apiInfo.cached ? (
              `캐시된 데이터 (${apiInfo.cacheAge}초 전)`
            ) : (
              `최신 데이터 (${new Date(apiInfo.timestamp).toLocaleTimeString('ko-KR')})`
            )}
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.95rem',
          }}
        >
          {error}
        </div>
      )}

      {/* 비디오 아이템 */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#999',
            fontSize: '0.95rem',
          }}
        >
          유튜브 영상 데이터를 불러오는 중입니다...
        </div>
      ) : videos.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {videos.map((video, i) => (
            <VideoCard key={i} video={video} index={i} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#999',
            fontSize: '0.95rem',
          }}
        >
          최근 7일 이내 업로드된 영상이 없습니다.
        </div>
      )}

      {/* CTA 버튼 */}
      {videos.length > 0 && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="https://www.youtube.com/results?search_query=KBO%EC%95%BC%EA%B5%AC&sp=CAI%253D"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#FF0000',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
              }}
            >
              유튜브에서 더 보기
            </button>
          </a>
        </div>
      )}
    </section>
  );
}

// ===== 비디오 카드 컴포넌트 =====
interface VideoCardProps {
  video: VideoItem;
  index: number;
}

function VideoCard({ video, index }: VideoCardProps) {
  const colors = [
    '#FF0000', // 유튜브 빨강
    '#CC0000',
    '#FF3333',
    '#E60000',
    '#990000',
    '#FF6666',
  ];
  const color = colors[index % colors.length];

  // 업로드 시간 계산
  const getTimeAgo = (dateStr: string): string => {
    const now = new Date();
    const published = new Date(dateStr);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    return '방금 전';
  };

  return (
    <a
      href={video.videoUrl ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#f9f9f9',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: `2px solid ${color}`,
        }}
        onMouseOver={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          el.style.transform = 'translateY(-3px)';
        }}
        onMouseOut={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = 'none';
          el.style.transform = 'none';
        }}
      >
        {/* 썸네일 */}
        <div
          style={{
            position: 'relative',
            paddingBottom: '56.25%',
            backgroundColor: '#000',
            overflow: 'hidden',
          }}
        >
          <img
            src={video.thumbnailMedium || video.thumbnail}
            alt={decodeEntities(video.title)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
            }}
          />

          {/* 유튜브 플레이 버튼 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              fontSize: '30px',
              color: '#fff',
            }}
            className="play-button"
          >
            ▶
          </div>
        </div>

        {/* 정보 섹션 */}
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 번호 뱃지 & 업로드 시간 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: color,
                color: '#fff',
                borderRadius: '50%',
                textAlign: 'center',
                lineHeight: '24px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }}
            >
              {index + 1}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#999' }}>
              {getTimeAgo(video.publishedAt)}
            </div>
          </div>

          {/* 제목 */}
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '0.5rem',
              lineHeight: '1.4',
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {decodeEntities(video.title)}
          </h3>

          {/* 채널 이름 */}
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.8rem' }}>
            {decodeEntities(video.channelTitle)}
          </div>

          {/* 링크 표시 */}
          <div
            style={{
              fontSize: '0.8rem',
              color: color,
              fontWeight: 'bold',
              marginTop: 'auto',
            }}
          >
            유튜브에서 보기 →
          </div>
        </div>
      </div>

      <style jsx>{`
        div:hover .play-button {
          opacity: 1;
        }
      `}</style>
    </a>
  );
}
