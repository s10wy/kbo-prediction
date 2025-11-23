// src/app/main/page.tsx
// 메인 페이지 컴포넌트
'use client';
import React from 'react';
import Link from 'next/link';
import NewsSection from '@/components/NewsSection';
import YoutubeSection from '@/components/YoutubeSection';
import TeamRanksSection from '@/components/TeamRanksSection';
import DailyGamesSection from '@/components/DailyGamesSection';

export default function MainPage() {
  return (
    <main>
      {/* ===== 헤로 배너 ===== */}
      <section
        style={{
          paddingTop: '120px',
          paddingRight: '2rem',
          paddingBottom: '3rem',
          paddingLeft: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          ⚾ KBO 야구 정보
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          경기, 뉴스, 선수 정보 모두 한눈에!
        </p>
      </section>

      {/* ===== 메인 컨텐츠 ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingRight: '2rem', paddingLeft: '2rem', paddingBottom: '2rem' }}>
        {/* 네비게이션 카드 */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            🎯 빠른 메뉴
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <NavCard
              icon="🔮"
              title="실시간 예측"
              description="경기 예측하기"
              href="/predict-real-time"
              color="#667eea"
            />
            <NavCard
              icon="📊"
              title="누적 예측"
              description="시즌 결과 보기"
              href="/predict"
              color="#764ba2"
            />
            <NavCard
              icon="🏆"
              title="팀 순위"
              description="순위 조회"
              href="/season"
              color="#f093fb"
            />
            <NavCard
              icon="🧾"
              title="선수 정보"
              description="선수 기록 보기"
              href="/players"
              color="#4facfe"
            />
          </div>
        </section>

        {/* 뉴스 섹션 */}
        <NewsSection />
        
        {/* 유튜브 섹션 */}
        <YoutubeSection />

        {/* 팀 순위 섹션 */}
        <TeamRanksSection />

        {/* 경기 정보 섹션 */}
        <DailyGamesSection />
      </div>
    </main>
  );
}

// ===== 타입 정의 =====
interface NavCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  color: string;
}

// ===== 네비게이션 카드 컴포넌트 =====
function NavCard({ icon, title, description, href, color }: NavCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          padding: '2rem',
          borderRadius: '12px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          borderLeft: `4px solid ${color}`,
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
          {title}
        </h3>
        <p style={{ color: '#666', fontSize: '0.95rem' }}>
          {description} →
        </p>
      </div>
    </Link>
  );
}