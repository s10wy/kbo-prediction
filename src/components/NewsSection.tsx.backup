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

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 뉴스 가져오기
    fetch("/api/news?query=KBO야구&display=6")
      .then((res) => res.json())
      .then((data) => {
        setNews(Array.isArray(data.items) ? data.items : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section
      style={{
        marginBottom: "3rem",
        padding: "2rem",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      {/* 헤더 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            color: "#333",
          }}
        >
          📰 최신 뉴스
        </h2>
        <p style={{ color: "#666", fontSize: "0.95rem", opacity: 0.8 }}>
          KBO 야구의 최신 뉴스와 소식을 한눈에 확인하세요
        </p>
      </div>

      {/* 뉴스 아이템 */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#999",
            fontSize: "0.95rem",
          }}
        >
          📰 뉴스 데이터를 불러오는 중입니다...
        </div>
      ) : news.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {news.map((item, i) => (
            <NewsCard key={i} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#999",
            fontSize: "0.95rem",
          }}
        >
          뉴스 데이터를 불러올 수 없습니다.
        </div>
      )}

      {/* CTA 버튼 */}
      {news.length > 0 && (
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <a
            href="https://m.sports.naver.com/kbaseball/index"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }}
            >
              📰 더 많은 뉴스 보기
            </button>
          </a>
        </div>
      )}
    </section>
  );
}

// ===== 뉴스 카드 컴포넌트 =====
interface NewsCardProps {
  item: { title: string; link: string };
  index: number;
}

function NewsCard({ item, index }: NewsCardProps) {
  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#00f2fe",
    "#43e97b",
  ];
  const color = colors[index % colors.length];

  return (
    <a
      href={item.link ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: `2px solid ${color}`,
          transition: "all 0.3s ease",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseOver={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = "#fff";
          el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
          el.style.transform = "translateY(-3px)";
        }}
        onMouseOut={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = "#f9f9f9";
          el.style.boxShadow = "none";
          el.style.transform = "none";
        }}
      >
        {/* 번호 */}
        <div
          style={{
            display: "inline-block",
            width: "24px",
            height: "24px",
            backgroundColor: color,
            color: "#fff",
            borderRadius: "50%",
            textAlign: "center",
            lineHeight: "24px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            marginBottom: "0.8rem",
          }}
        >
          {index + 1}
        </div>

        {/* 제목 */}
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "0.8rem",
            lineHeight: "1.4",
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {decodeEntities(item.title)}
        </h3>

        {/* 링크 표시 */}
        <div
          style={{
            fontSize: "0.8rem",
            color: color,
            fontWeight: "bold",
            marginTop: "auto",
          }}
        >
          자세히 보기 →
        </div>
      </div>
    </a>
  );
}