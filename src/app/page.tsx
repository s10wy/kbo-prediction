// src/app/page.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function IntroPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* ===== Hero 섹션 ===== */}
      <section
        style={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          overflow: 'hidden',
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        {/* 배경 꾸밈 */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* 콘텐츠 */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px', padding: '0 2rem' }}>
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.2',
              animation: 'fadeInDown 1s ease-out',
            }}
          >
            🔮 KBO 야구 <br /> 승부 예측 시스템
          </h1>

          <p
            style={{
              fontSize: '1.3rem',
              marginBottom: '2rem',
              opacity: 0.95,
              lineHeight: '1.6',
              animation: 'fadeInUp 1s ease-out 0.2s backwards',
            }}
          >
            AI 머신러닝 모델을 활용한 <strong>실시간 경기 예측</strong>
            <br />
            2009-2024년 데이터로 학습된 고정확도 예측 시스템
          </p>

          {/* CTA 버튼 */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeInUp 1s ease-out 0.4s backwards',
            }}
          >
            <Link href="/main" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  backgroundColor: '#fff',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                }}
              >
                🚀 시작하기
              </button>
            </Link>

            <a
              href="#features"
              style={{ textDecoration: 'none' }}
            >
              <button
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '2px solid #fff',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#667eea';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                📖 더 알아보기
              </button>
            </a>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'bounce 2s infinite',
          }}
        >
          <div style={{ fontSize: '2rem' }}>↓</div>
        </div>

        <style jsx>{`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes bounce {
            0%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            50% {
              transform: translateX(-50%) translateY(10px);
            }
          }
        `}</style>
      </section>

      {/* ===== 기능 섹션 ===== */}
      <section id="features" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '3rem',
            color: '#333',
          }}
        >
          🎯 주요 기능
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* 기능 카드 1 */}
          <FeatureCard
            icon="🔮"
            title="실시간 예측"
            description="특정 날짜의 경기를 선택하여 AI 모델의 실시간 예측을 즉시 확인"
            stats="약 2-3초 응답"
          />

          {/* 기능 카드 2 */}
          <FeatureCard
            icon="📊"
            title="누적 예측 결과"
            description="2025년 3월~11월 경기에 대한 축적된 예측 결과 및 정확도 분석"
            stats="55% 정확도"
          />

          {/* 기능 카드 3 */}
          <FeatureCard
            icon="🏆"
            title="팀 순위 정보"
            description="실시간 팀 순위, 승률, 타율, 방어율 등 다양한 통계 데이터"
            stats="10개 구단"
          />

          {/* 기능 카드 4 */}
          <FeatureCard
            icon="🧾"
            title="선수 정보"
            description="구단별 선수의 타자/투수 기록 및 시즌 통계 조회"
            stats="500+ 선수"
          />

          {/* 기능 카드 5 */}
          <FeatureCard
            icon="📈"
            title="시즌 통계"
            description="팀별 평균 승률, 전체 경기 수, 구단별 분석 데이터"
            stats="2009-2024년"
          />

          {/* 기능 카드 6 */}
          <FeatureCard
            icon="⚡"
            title="고속 응답"
            description="Vercel + Python 최적화로 빠른 처리 속도 제공"
            stats="75% 개선"
          />
        </div>
      </section>

      {/* ===== 기술 스택 섹션 ===== */}
      <section
        style={{
          padding: '4rem 2rem',
          backgroundColor: '#f0f0f0',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '3rem',
            color: '#333',
            maxWidth: '1200px',
            margin: '0 auto 3rem',
          }}
        >
          🛠️ 기술 스택
        </h2>

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
          }}
        >
          <TechStack title="프론트엔드" items={['Next.js', 'TypeScript', 'React', 'CSS-in-JS']} />
          <TechStack title="백엔드" items={['Python', 'Flask', 'PostgreSQL', 'SQLAlchemy']} />
          <TechStack title="AI/ML" items={['Logistic Regression', 'Meta Learning', 'Pandas', 'NumPy']} />
          <TechStack title="배포" items={['Vercel', 'Render', 'GitHub', 'Docker']} />
        </div>
      </section>

      {/* ===== 모델 섹션 ===== */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '3rem',
            color: '#333',
          }}
        >
          🤖 AI 모델 정보
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          <ModelInfo
            name="Logistic Regression"
            description="기본 예측 모델"
            accuracy="54%"
            speed="매우 빠름"
            status="✅ 사용 중"
          />
          <ModelInfo
            name="Meta Learning"
            description="최종 앙상블 모델"
            accuracy="55%"
            speed="빠름"
            status="✅ 사용 중"
          />
          <ModelInfo
            name="학습 데이터"
            description="KBO 경기 데이터"
            accuracy="16년"
            speed="2009-2024"
            status="✅ 완료"
          />
        </div>
      </section>

      {/* ===== CTA 섹션 ===== */}
      <section
        style={{
          padding: '4rem 2rem',
          backgroundColor: '#667eea',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          지금 바로 시작해보세요!
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.95 }}>
          AI 기반 실시간 KBO 야구 경기 예측으로 더 정확한 예측을 해보세요
        </p>

        <Link href="/main" style={{ textDecoration: 'none' }}>
          <button
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              backgroundColor: '#fff',
              color: '#667eea',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
          >
            🚀 메인 페이지로 이동
          </button>
        </Link>
      </section>

      {/* ===== 푸터 ===== */}
      <footer
        style={{
          padding: '2rem',
          backgroundColor: '#333',
          color: '#fff',
          textAlign: 'center',
          fontSize: '0.9rem',
        }}
      >
        <p>⚾ KBO 야구 예측 시스템 © 2025 - AI 기반 경기 예측</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
          Vercel + Render + PostgreSQL로 제공되는 프로덕션 서비스
        </p>
      </footer>
    </div>
  );
}

// ===== 컴포넌트 =====
function FeatureCard({ icon, title, description, stats }) {
  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
        {title}
      </h3>
      <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.5' }}>{description}</p>
      <div
        style={{
          padding: '0.5rem',
          backgroundColor: '#f0f0f0',
          borderRadius: '6px',
          color: '#667eea',
          fontWeight: 'bold',
        }}
      >
        {stats}
      </div>
    </div>
  );
}

function TechStack({ title, items }) {
  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
        {title}
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ padding: '0.5rem 0', color: '#666' }}>
            ✓ {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModelInfo({ name, description, accuracy, speed, status }) {
  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        border: '2px solid #667eea',
      }}
    >
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
        {name}
      </h3>
      <p style={{ color: '#666', marginBottom: '1rem' }}>{description}</p>
      <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
        <div>
          <strong>정확도:</strong> {accuracy}
        </div>
        <div>
          <strong>속도:</strong> {speed}
        </div>
        <div style={{ color: '#10b981', fontWeight: 'bold' }}>{status}</div>
      </div>
    </div>
  );
}