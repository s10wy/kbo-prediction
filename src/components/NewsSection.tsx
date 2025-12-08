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
type NewsItem = {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  originallink?: string;
};

type ApiResponse = {
  items: NewsItem[];
  total: number;
  query: string;
  recentHours: number;
  timestamp: string;
  cached?: boolean;
  cacheAge?: number;
};

// ===== 메인 컴포넌트 =====
export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiInfo, setApiInfo] = useState<{
    cached: boolean;
    timestamp: string;
    cacheAge?: number;
  } | null>(null);

  // 데이터 가져오기
  const fetchNews = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');

      const refreshParam = forceRefresh ? '&refresh=true' : '';
      const response = await fetch(
        `/api/news?query=KBO야구&display=6&sort=date&recent=24${refreshParam}`
      );

      if (!response.ok) {
        throw new Error('뉴스 API 호출 실패');
      }

      const data: ApiResponse = await response.json();

      setNews(data.items || []);
      setApiInfo({
        cached: data.cached || false,
        timestamp: data.timestamp,
        cacheAge: data.cacheAge,
      });
      setLoading(false);
    } catch (err) {
      console.error('[NewsSection] 오류:', err);
      setError('뉴스를 불러올 수 없습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchNews(true);
  };

  // 시간 계산
  const getTimeAgo = (dateStr: string): string => {
    try {
      const now = new Date();
      const published = new Date(dateStr);
      const diffMs = now.getTime() - published.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}일 전`;
      if (diffHours > 0) return `${diffHours}시간 전`;
      return '방금 전';
    } catch {
      return '';
    }
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
            최신 뉴스
          </h2>

          {/* 새로고침 버튼 */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading ? '#ccc' : 'var(--color-primary)',
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
          KBO 야구의 최신 뉴스와 소식을 한눈에 확인하세요
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

      {/* 뉴스 아이템 */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#999',
            fontSize: '0.95rem',
          }}
        >
          뉴스 데이터를 불러오는 중입니다...
        </div>
      ) : news.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {news.map((item, i) => (
            <NewsCard key={i} item={item} index={i} getTimeAgo={getTimeAgo} />
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
          최근 24시간 이내 뉴스가 없습니다.
        </div>
      )}

      {/* CTA 버튼 */}
      {news.length > 0 && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="https://m.sports.naver.com/kbaseball/index"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-primary)',
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
              네이버 스포츠에서 더 보기
            </button>
          </a>
        </div>
      )}
    </section>
  );
}

// ===== 뉴스 카드 컴포넌트 =====
interface NewsCardProps {
  item: NewsItem;
  index: number;
  getTimeAgo: (dateStr: string) => string;
}

function NewsCard({ item, index, getTimeAgo }: NewsCardProps) {
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
  ];
  const color = colors[index % colors.length];

  return (
    <a
      href={item.link ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: `2px solid ${color}`,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseOver={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = '#fff';
          el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          el.style.transform = 'translateY(-3px)';
        }}
        onMouseOut={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = '#f9f9f9';
          el.style.boxShadow = 'none';
          el.style.transform = 'none';
        }}
      >
        {/* 번호 & 시간 */}
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
          {item.pubDate && (
            <div style={{ fontSize: '0.75rem', color: '#999' }}>
              {getTimeAgo(item.pubDate)}
            </div>
          )}
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
          {decodeEntities(item.title)}
        </h3>

        {/* 설명 (있으면) */}
        {item.description && (
          <p
            style={{
              fontSize: '0.85rem',
              color: '#666',
              marginBottom: '0.8rem',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {decodeEntities(item.description)}
          </p>
        )}

        {/* 링크 표시 */}
        <div
          style={{
            fontSize: '0.8rem',
            color: color,
            fontWeight: 'bold',
            marginTop: 'auto',
          }}
        >
          자세히 보기 →
        </div>
      </div>
    </a>
  );
}
