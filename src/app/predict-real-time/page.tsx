// src/app/predict-real-time/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
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
  홈선발?: string;
  원정선발?: string;
};

export default function PredictRealTimePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ 필터 상태 추가
  const [filterTeam, setFilterTeam] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<'probability' | 'stadium'>('probability');

  // ✅ 자동 예측 (페이지 로드 시 오늘 날짜 예측)
  useEffect(() => {
    handlePredict();
  }, []);

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

  // ✅ 팀 목록 추출 (필터용)
  const teams = ['전체', ...new Set(predictions.flatMap(p => [p.홈팀, p.원정팀]))];

  // ✅ 필터링 및 정렬
  const filteredPredictions = predictions
    .filter(p => 
      filterTeam === '전체' || p.홈팀 === filterTeam || p.원정팀 === filterTeam
    )
    .sort((a, b) => {
      if (sortBy === 'probability') {
        return b.예측확률 - a.예측확률;
      }
      return a.구장.localeCompare(b.구장);
    });

  // ✅ 신뢰도 레벨 계산
  const getConfidenceLevel = (prob: number) => {
    if (prob >= 0.65) return { level: '매우 높음', color: '#10b981' };
    if (prob >= 0.6) return { level: '높음', color: '#60a5fa' };
    if (prob >= 0.55) return { level: '보통', color: '#f59e0b' };
    return { level: '낮음', color: '#ef4444' };
  };

  // ✅ CSV 다운로드
  const downloadCSV = () => {
    const csv = [
      ['날짜', '구장', '홈팀', '원정팀', '예측승리팀', '예측확률'],
      ...predictions.map(p => [
        p.날짜,
        p.구장,
        p.홈팀,
        p.원정팀,
        p.예측승리팀,
        (p.예측확률 * 100).toFixed(1) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `예측결과_${selectedDate}.csv`;
    link.click();
  };

  return (
    <main style={{ padding: '120px 2rem 2rem' }}>
      {/* 페이지 헤더 + 우상단 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.7rem', marginBottom: '0.5rem' }}>
            🔮 실시간 경기 예측
          </h1>
          <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>
            특정 날짜의 경기를 선택하여 AI 모델의 실시간 예측을 확인해보세요.
          </p>
        </div>
        
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
            min="2009-01-01"
            max="2024-12-31"
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
          
          {/* ✅ 빠른 날짜 선택 버튼 */}
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setSelectedDate(today);
            }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-navbar-bg)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '1px solid var(--color-card-border)',
              transition: 'all 0.3s ease',
            }}
          >
            📆 오늘
          </button>
        </div>
      </section>

      {/* ✅ 필터 & 정렬 섹션 */}
      {!loading && predictions.length > 0 && (
        <section className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* 팀 필터 */}
              <div>
                <label style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '0.5rem' }}>
                  🏆 팀 필터:
                </label>
                <select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-card-border)',
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {/* 정렬 */}
              <div>
                <label style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '0.5rem' }}>
                  📊 정렬:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'probability' | 'stadium')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-card-border)',
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="probability">확률 높은 순</option>
                  <option value="stadium">구장 순</option>
                </select>
              </div>
            </div>

            {/* ✅ CSV 다운로드 버튼 */}
            <button
              onClick={downloadCSV}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#10b981',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              📥 CSV 다운로드
            </button>
          </div>
        </section>
      )}

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
      {!loading && filteredPredictions.length > 0 && (
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title">⚾ {selectedDate} 경기 예측 결과</h2>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {filterTeam !== '전체' ? `${filterTeam} 경기 ${filteredPredictions.length}건` : `총 ${predictions.length}건`}
            </div>
          </div>
          
          {/* ✅ 통계 개선 */}
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
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>평균 신뢰도</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>
                {(predictions.reduce((sum, p) => sum + p.예측확률, 0) / predictions.length * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>고신뢰도 경기</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
                {predictions.filter(p => p.예측확률 >= 0.6).length}
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
            {filteredPredictions.map((pred, idx) => {
              const confidence = getConfidenceLevel(pred.예측확률);
              
              return (
                <div
                  key={`${pred.gameId}-${idx}`}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-card-bg)',
                    border: `2px solid ${pred.예측승리팀 === pred.홈팀 ? '#60a5fa' : '#f59e0b'}`,
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

                  {/* 경기 스코어 (구단 이미지 포함) */}
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
                            opacity: pred.예측승리팀 === pred.홈팀 ? 1 : 0.5,
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/teams/default.png';
                          }}
                        />
                      </div>
                      <div style={{ 
                        fontWeight: pred.예측승리팀 === pred.홈팀 ? 'bold' : 'normal',
                        fontSize: '1rem',
                        color: pred.예측승리팀 === pred.홈팀 ? 'var(--color-primary)' : 'var(--color-text)'
                      }}>
                        {pred.홈팀}
                        {pred.예측승리팀 === pred.홈팀 && ' 🏆'}
                      </div>
                      {/* ✅ 투수 정보 추가 */}
                      {pred.홈선발 && (
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
                          ⚾ {pred.홈선발}
                        </div>
                      )}
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
                            opacity: pred.예측승리팀 === pred.원정팀 ? 1 : 0.5,
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/teams/default.png';
                          }}
                        />
                      </div>
                      <div style={{ 
                        fontWeight: pred.예측승리팀 === pred.원정팀 ? 'bold' : 'normal',
                        fontSize: '1rem',
                        color: pred.예측승리팀 === pred.원정팀 ? 'var(--color-primary)' : 'var(--color-text)'
                      }}>
                        {pred.원정팀}
                        {pred.예측승리팀 === pred.원정팀 && ' 🏆'}
                      </div>
                      {/* ✅ 투수 정보 추가 */}
                      {pred.원정선발 && (
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
                          ⚾ {pred.원정선발}
                        </div>
                      )}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1rem' }}>
                        확률: <span style={{ fontWeight: 'bold', color: confidence.color }}>
                          {(pred.예측확률 * 100).toFixed(1)}%
                        </span>
                      </div>
                      {/* ✅ 신뢰도 뱃지 */}
                      <div
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: confidence.color,
                          color: '#fff',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {confidence.level}
                      </div>
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
                        backgroundColor: confidence.color,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
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
