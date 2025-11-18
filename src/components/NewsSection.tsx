// src/components/NewsSection.tsx
'use client';
import React, { useEffect, useState } from "react";

function decodeEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "")
    .replace(/&#32;/g, " ");
}

type NewsItem = { title: string; link: string };
type VideoItem = { title: string; videoUrl: string; thumbnail: string };

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    // 뉴스 가져오기
    fetch("/api/news?query=KBO야구&display=6")
      .then((res) => res.json())
      .then((data) => setNews(Array.isArray(data.items) ? data.items : []));

    // 유튜브 영상 가져오기
    fetch("/api/youtube?query=KBO야구뉴스&count=3")
      .then((res) => res.json())
      .then((data) => setVideos(Array.isArray(data.videos) ? data.videos : []));
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {/* 📰 최신 뉴스 슬라이드 */}
      <div
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          width: "100%",
          padding: "0.5rem 0",
        }}
        className="news-marquee"
      >
        <div
          className="news-track"
          style={{
            display: "inline-block",
            animation: "newsScroll 25s linear infinite",
          }}
        >
          {news.length > 0 ? (
            <>
              {news.concat(news).map((item, i) => (
                <a
                  key={i}
                  href={item.link ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginRight: "2rem",
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    whiteSpace: "nowrap",
                  }}
                >
                  • {decodeEntities(item.title)}
                </a>
              ))}
            </>
          ) : (
            <span style={{ color: "gray", fontSize: "0.9rem" }}>
              뉴스 데이터를 불러오는 중입니다...
            </span>
          )}
        </div>

        {/* hover 시 애니메이션 멈춤 */}
        <style jsx>{`
          @keyframes newsScroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .news-marquee:hover .news-track {
            animation-play-state: paused;
          }
          @media (max-width: 768px) {
            .news-track {
              animation: newsScroll 35s linear infinite;
            }
          }
        `}</style>
      </div>

      {/* 📺 유튜브 영상 섹션 */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3
          style={{
            fontSize: "1.2rem",
            marginBottom: "0.8rem",
            color: "var(--color-primary)",
          }}
        >
          📺 야구 유튜브 영상
        </h3>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}
        >
          {videos.length > 0 ? (
            videos.map((video, i) => (
              <a
                key={i}
                href={video.videoUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <img
                  src={video.thumbnail}
                  alt={decodeEntities(video.title)}
                  style={{
                    width: "100%",
                    height: "110px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                />
                <p
                  style={{
                    marginTop: "0.4rem",
                    fontSize: "0.85rem",
                    color: "var(--color-text)",
                    textAlign: "center",
                    lineHeight: 1.3,
                    height: "2.2rem",
                    overflow: "hidden",
                  }}
                >
                  {decodeEntities(video.title)}
                </p>
              </a>
            ))
          ) : (
            <p style={{ fontSize: "0.9rem", color: "gray" }}>
              유튜브 데이터를 불러오는 중입니다...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
