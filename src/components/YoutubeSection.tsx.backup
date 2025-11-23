'use client';
import React, { useEffect, useState } from 'react';

function decodeEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/&#32;/g, ' ');
}

type VideoItem = {
  title: string;
  videoUrl: string;
  thumbnail: string;
};

export default function YoutubeSection() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 유튜브 영상 가져오기
    fetch('/api/youtube?query=KBO야구뉴스&count=6')
      .then((res) => res.json())
      .then((data) => {
        setVideos(Array.isArray(data.videos) ? data.videos : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

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
        <h2
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#333',
          }}
        >
          📺 야구 유튜브 영상
        </h2>
        <p style={{ color: '#666', fontSize: '0.95rem', opacity: 0.8 }}>
          KBO 야구의 최신 영상과 분석을 감상하세요
        </p>
      </div>

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
          📺 유튜브 영상 데이터를 불러오는 중입니다...
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
          유튜브 영상 데이터를 불러올 수 없습니다.
        </div>
      )}

      {/* CTA 버튼 */}
      {videos.length > 0 && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="https://www.youtube.com/results?search_query=KBO%EC%95%BC%EA%B5%AC"
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
                (e.currentTarget as HTMLButtonElement).style.transform =
                  'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
              }}
            >
              📺 더 많은 영상 보기
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
    '#CC0000', // 어두운 빨강
    '#FF3333', // 밝은 빨강
    '#E60000', // 강한 빨강
    '#990000', // 매우 어두운 빨강
    '#FF6666', // 라이트 빨강
  ];
  const color = colors[index % colors.length];

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
            src={video.thumbnail}
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
            onLoad={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              const parent = img.parentElement;
              if (parent) {
                parent.onmouseover = () => {
                  img.style.transform = 'scale(1.05)';
                };
                parent.onmouseout = () => {
                  img.style.transform = 'scale(1)';
                };
              }
            }}
          />

          {/* 유튜브 플레이 버튼 오버레이 */}
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
            }}
            className="play-button"
          >
            ▶
          </div>
        </div>

        {/* 정보 섹션 */}
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 번호 뱃지 */}
          <div
            style={{
              display: 'inline-block',
              width: '24px',
              height: '24px',
              backgroundColor: color,
              color: '#fff',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '24px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '0.8rem',
            }}
          >
            {index + 1}
          </div>

          {/* 제목 */}
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '0.8rem',
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