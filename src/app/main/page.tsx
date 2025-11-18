// src/app/page.tsx
import NewsSection from "@/components/NewsSection";
import TeamRanksSection from "@/components/TeamRanksSection";
import TopPlayersSection from "@/components/TopPlayersSection";
import DailyGamesSection from "@/components/DailyGamesSection";

export default function HomePage() {
  return (
    <main style={{ padding: "120px 2rem 2rem 2rem" }}>
      <section style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "var(--color-primary)",
          }}
        >
          ⚾ 야구정보 알려드립니다
        </h1>
        <p style={{ color: "var(--color-text)", opacity: 0.8 }}>
           경기, 뉴스, 선수 정보 모두 한눈에!
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* 📰 최신 뉴스 */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.4rem",
              marginBottom: "1rem",
              color: "var(--color-primary)",
            }}
          >
            📰 최신 뉴스
          </h2>
          <NewsSection /> {/* ✅ 자동 슬라이드 배너 */}
        </div>

        {/* 🏆 팀 순위 */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.4rem",
              marginBottom: "1rem",
              color: "var(--color-primary)",
            }}
          >
            🏆 팀 순위
          </h2>
          <TeamRanksSection /> {/* ✅ 자동 슬라이드 배너 */}
        </div>

        {/* ⚾ 선수 기록 */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.4rem",
              marginBottom: "1rem",
              color: "var(--color-primary)",
            }}
          >
            ⚾ 선수 기록
          </h2>
          <TopPlayersSection /> {/* ✅ 자동 슬라이드 배너 */}
        </div>

        {/* 🏟️ 오늘의 경기 */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.4rem",
              marginBottom: "1rem",
              color: "var(--color-primary)",
            }}
          >
            🏟️ 오늘의 경기
          </h2>
          <DailyGamesSection /> {/* ✅ 자동 슬라이드 배너 */}
        </div>
      </div>
    </main>
  );
}
