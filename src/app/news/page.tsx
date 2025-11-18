// src/app/news/page.tsx
'use client'
import React, { useEffect, useState } from 'react'

// 간단한 엔티티 디코딩 함수 (텍스트 깨짐 방지)
function decodeEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#39;/g, "'")      // 작은따옴표
    .replace(/&quot;/g, '"')   // 큰따옴표
    .replace(/&amp;/g, '&')    // 앰퍼샌드
    .replace(/<[^>]+>/g, '')  // HTML 태그 제거
    .replace(/&#32;/g, ' ');  // 공백
}

type NewsItem = { title: string; link: string }
type VideoItem = { title: string; videoUrl: string; thumbnail: string }

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])

  useEffect(() => {
  fetch('/api/news?query=KBO&display=5')//query 파라미터로 검색어 설정, display로 최대 뉴스개수 설정 (현제 최대10개로 제한됨)
    .then(res => res.json())
    .then(data => setNews(Array.isArray(data.items) ? data.items : []))

  fetch('/api/youtube?query=KBO야구뉴스&count=3')//query 파라미터로 검색어 설정, count로 최대 영상개수 설정
    .then(res => res.json())
    .then(data => setVideos(Array.isArray(data.videos) ? data.videos : []))
}, [])


  return (
    <main style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>📰 최신 뉴스</h2>
      <ul style={{ marginBottom: '36px', listStyle: 'none', padding: 0 }}>
        {news.map((item, i) => (
          <li key={i} style={{ marginBottom: '12px' }}>
            <a
              href={item.link ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '1rem' }}
            >
              {decodeEntities(item.title)}
            </a>
          </li>
        ))}
        {news.length === 0 && <li>뉴스 데이터가 없습니다.</li>}
      </ul>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>📺 야구 유튜브 영상</h2>
      <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
        {videos.map((video, i) => (
          <div key={i} style={{ width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px' }}>
            <a
              href={video.videoUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', textAlign: 'center' }}
            >
              <img
                src={video.thumbnail}
                alt={decodeEntities(video.title)}
                style={{ width: 200, height: 112, objectFit: 'cover', borderRadius: 12, boxShadow: '0 2px 8px #ccc', marginBottom: 10 }}
              />
              <div style={{ fontSize: '0.98rem', color: '#222', marginTop: '6px', lineHeight: '1.28', wordBreak: 'keep-all' }}>
                {decodeEntities(video.title)}
              </div>
            </a>
          </div>
        ))}
        {videos.length === 0 && <div style={{ fontSize: '1rem' }}>유튜브 데이터가 없습니다.</div>}
      </div>
    </main>
  );
}
