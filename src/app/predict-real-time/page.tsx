// src/app/predict-real-time/page.tsx

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Prediction = {
  gameId: string;
  날짜: string;
  구장: string;
  홈팀: string;
  원정팀: string;
  예측승리팀: string;
  예측확률: number;
};

export default function PredictRealTimePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPredictions([]);

    try {
      const response = await fetch(`/api/predict-real-time?date=${selectedDate}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '예측 실패');
        return;
      }

      setPredictions(data.predictions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '120px 2rem 2rem' }}>
      {/* ⭐ 페이지 헤더 + 우상단 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.7rem', marginBottom: '0.5rem' }}>
            🔮 실시간 경기 예측
          </h1>
          <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>
            특정 날짜의 경기를 선택하여 AI 모델의 실시간 예측을 확인해보세요.
          </p>
        </div>
        
        {/* ⭐ "시즌예측 결과" 버튼 */}
        <Link href="/predict" style={{ textDecoration: 'none' }}>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'none';
            }}
          >
            📊 시즌예측 결과
          </button>
        </Link>
      </div>

      {/* 날짜 선택 섹션 */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">📅 날짜 선택</h2>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-card-border)',
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-text)',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          />
          <button
            onClick={handlePredict}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: loading ? '#ccc' : 'var(--color-primary)',
              color: loading ? '#666' : '#fff',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? '⏳ 예측 중...' : '🎲 예측하기'}
          </button>
        </div>
      </section>

      {/* 로딩 상태 */}
      {loading && (
        <section className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⏳ 예측을 수행 중입니다...</div>
          <p style={{ color: 'var(--color-text)', opacity: 0.7 }}>
            이 과정은 최대 30초 정도 소요될 수 있습니다.
          </p>
          <div
            style={{
              marginTop: '1rem',
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: 'var(--color-primary)',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </div>
          <style jsx>{`
            @keyframes pulse {
              0% { width: 0%; }
              50% { width: 100%; }
              100% { width: 0%; }
            }
          `}</style>
        </section>
      )}

      {/* 에러 표시 */}
      {error && !loading && (
        <section className="card" style={{ marginBottom: '2rem', borderColor: '#ef4444' }}>
          <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ❌ 오류
          </div>
          <p style={{ marginTop: '0.5rem', color: 'var(--color-text)' }}>{error}</p>
        </section>
      )}

      {/* 예측 결과 */}
      {!loading && predictions.length > 0 && (
        <section className="card">
          <h2 className="section-title">⚾ {selectedDate} 경기 예측 결과</h2>
          
          {/* 통계 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>총 경기 수</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {predictions.length}
              </div>
            </div>
          </div>

          {/* 경기 카드 그리드 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.5rem',
            }}
          >
            {predictions.map((pred, idx) => (
              <div
                key={`${pred.gameId}-${idx}`}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-card-bg)',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                {/* 경기 정보 */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                    📍 {pred.구장}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                    {pred.날짜}
                  </div>
                </div>

                {/* ⭐ 경기 스코어 (구단 이미지 포함) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: 'var(--color-navbar-bg)',
                    borderRadius: '0.5rem',
                  }}
                >
                  {/* 홈팀 */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 0.5rem' }}>
                      <Image
                        src={`/teams/${pred.홈팀}.png`}
                        alt={pred.홈팀}
                        fill
                        style={{
                          objectFit: 'contain',
                          borderRadius: '0.5rem',
                        }}
                        onError={(e) => {
                          // 이미지 로드 실패 시 기본 이미지 표시
                          e.currentTarget.src = '/teams/default.png';
                        }}
                      />
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      {pred.홈팀}
                    </div>
                  </div>

                  {/* vs */}
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, margin: '0 1rem', fontWeight: 'bold' }}>
                    vs
                  </div>

                  {/* 원정팀 */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 0.5rem' }}>
                      <Image
                        src={`/teams/${pred.원정팀}.png`}
                        alt={pred.원정팀}
                        fill
                        style={{
                          objectFit: 'contain',
                          borderRadius: '0.5rem',
                        }}
                        onError={(e) => {
                          // 이미지 로드 실패 시 기본 이미지 표시
                          e.currentTarget.src = '/teams/default.png';
                        }}
                      />
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      {pred.원정팀}
                    </div>
                  </div>
                </div>

                {/* 예측 결과 */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f0f4ff',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                    🤖 AI 예측
                  </div>
                  <div
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      color: 'var(--color-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {pred.예측승리팀}
                  </div>
                  <div style={{ fontSize: '1rem' }}>
                    신뢰도: <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>
                      {(pred.예측확률 * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 신뢰도 바 */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pred.예측확률 * 100}%`,
                      backgroundColor: '#60a5fa',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 데이터 없음 */}
      {!loading && predictions.length === 0 && !error && (
        <section className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--color-text)', opacity: 0.7 }}>
            예측 버튼을 클릭하여 선택한 날짜의 경기 예측 결과를 확인하세요.
          </p>
        </section>
      )}

      {/* 안내 */}
      <section className="card" style={{ marginTop: '2rem' }}>
        <h3 className="section-title">📌 사용 안내</h3>
        <ul style={{ lineHeight: '1.8', color: 'var(--color-text)' }}>
          <li>✅ 특정 날짜를 선택하여 실시간 예측을 수행합니다.</li>
          <li>⏱️ 예측에는 최대 30초가 소요될 수 있습니다.</li>
          <li>🤖 AI 모델은 2009-2024년 데이터로 학습되었습니다.</li>
          <li>📊 신뢰도는 예측의 신뢰성을 나타냅니다 (높을수록 좋음).</li>
          <li>⚠️ 예측은 참고용이며, 실제 경기 결과와 다를 수 있습니다.</li>
        </ul>
      </section>
    </main>
  );
}