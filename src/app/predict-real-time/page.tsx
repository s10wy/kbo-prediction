// src/app/predict-real-time/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Pitcher {
  name: string;
  era: number;
  whip: number;
  kbb: number;
  qs: number;
}

interface PredictionResult {
  success: boolean;
  homeTeam: string;
  awayTeam: string;
  homePitcher: string;
  awayPitcher: string;
  predictedWinner: string;
  predictedProbability: number;
  modelDetails: {
    logistic: number;
    xgboost: number;
    lightgbm: number;
    catboost: number;
    meta: number;
  };
  error?: string;
}

const TEAMS = ['두산', 'KIA', 'LG', 'SK', 'NC', '삼성', '한화', 'SSG', '롯데', 'KT'];

export default function PredictRealTime() {
  // 선택 상태
  const [homeTeam, setHomeTeam] = useState<string>('');
  const [awayTeam, setAwayTeam] = useState<string>('');
  const [homePitcher, setHomePitcher] = useState<string>('');
  const [awayPitcher, setAwayPitcher] = useState<string>('');

  // 데이터 상태
  const [homePitchers, setHomePitchers] = useState<Pitcher[]>([]);
  const [awayPitchers, setAwayPitchers] = useState<Pitcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>('');

  // 홈 팀 선택 시 투수 로드
  useEffect(() => {
    if (homeTeam) {
      loadPitchers(homeTeam, 'home');
      setHomePitcher(''); // 투수 선택 초기화
    }
  }, [homeTeam]);

  // 상대 팀 선택 시 투수 로드
  useEffect(() => {
    if (awayTeam) {
      loadPitchers(awayTeam, 'away');
      setAwayPitcher(''); // 투수 선택 초기화
    }
  }, [awayTeam]);

  // 팀별 투수 로드
  const loadPitchers = async (team: string, type: 'home' | 'away') => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/pitchers?team=${encodeURIComponent(team)}&season=2025`
      );
      
      if (!response.ok) {
        throw new Error('투수 데이터를 불러올 수 없습니다');
      }

      const data = await response.json();
      
      if (type === 'home') {
        setHomePitchers(data.pitchers || []);
      } else {
        setAwayPitchers(data.pitchers || []);
      }
    } catch (err) {
      setError(`투수 로드 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // 예측 수행
  const handlePredict = async () => {
    // 유효성 검사
    if (!homeTeam) {
      setError('홈 팀을 선택해주세요');
      return;
    }
    if (!awayTeam) {
      setError('상대 팀을 선택해주세요');
      return;
    }
    if (homeTeam === awayTeam) {
      setError('홈 팀과 상대 팀이 같을 수 없습니다');
      return;
    }
    if (!homePitcher) {
      setError('홈 팀 선발 투수를 선택해주세요');
      return;
    }
    if (!awayPitcher) {
      setError('상대 팀 선발 투수를 선택해주세요');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setPrediction(null);

      const response = await fetch('/api/predict-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeam,
          awayTeam,
          homePitcher,
          awayPitcher,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '예측에 실패했습니다');
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);
    } catch (err) {
      setError(`예측 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f5f7fa', padding: '2rem' }}>
      {/* 헤더 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
            🔮 실시간 경기 예측
          </h1>
        </Link>
        <p style={{ fontSize: '1.1rem', color: '#666', opacity: 0.8 }}>
          홈 팀, 상대 팀, 선발 투수를 선택하여 경기 결과를 예측합니다
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 예측 폼 */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
            ⚾ 경기 정보 입력
          </h2>

          {/* 에러 메시지 */}
          {error && (
            <div
              style={{
                backgroundColor: '#fee',
                borderLeft: '4px solid #f00',
                padding: '1rem',
                marginBottom: '1.5rem',
                borderRadius: '4px',
                color: '#c33',
              }}
            >
              {error}
            </div>
          )}

          {/* 입력 폼 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* 홈 팀 섹션 */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                🏠 홈 팀
              </h3>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                팀 선택
              </label>
              <select
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  borderRadius: '6px',
                  border: '2px solid #ddd',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                }}
              >
                <option value="">팀을 선택하세요</option>
                {TEAMS.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                선발 투수
              </label>
              <select
                value={homePitcher}
                onChange={(e) => setHomePitcher(e.target.value)}
                disabled={!homeTeam || homePitchers.length === 0}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '2px solid #ddd',
                  fontSize: '1rem',
                  cursor: homePitchers.length > 0 ? 'pointer' : 'not-allowed',
                  backgroundColor: homePitchers.length > 0 ? '#fff' : '#f0f0f0',
                  opacity: homePitchers.length > 0 ? 1 : 0.5,
                }}
              >
                <option value="">
                  {loading ? '로드 중...' : '투수를 선택하세요'}
                </option>
                {homePitchers.map((pitcher) => (
                  <option key={pitcher.name} value={pitcher.name}>
                    {pitcher.name} (ERA: {pitcher.era.toFixed(2)}, WHIP: {pitcher.whip.toFixed(2)})
                  </option>
                ))}
              </select>

              {homePitcher && homePitchers.find((p) => p.name === homePitcher) && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0f7ff', borderRadius: '6px' }}>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#333' }}>
                    <strong>선택된 투수:</strong> {homePitcher}
                  </p>
                  {(() => {
                    const pitcher = homePitchers.find((p) => p.name === homePitcher)!;
                    return (
                      <>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                          ERA: {pitcher.era.toFixed(2)} | WHIP: {pitcher.whip.toFixed(2)}
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                          K/BB: {pitcher.kbb.toFixed(2)} | QS: {pitcher.qs}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 상대 팀 섹션 */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                ✈️ 상대 팀
              </h3>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                팀 선택
              </label>
              <select
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  borderRadius: '6px',
                  border: '2px solid #ddd',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                }}
              >
                <option value="">팀을 선택하세요</option>
                {TEAMS.filter((team) => team !== homeTeam).map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                선발 투수
              </label>
              <select
                value={awayPitcher}
                onChange={(e) => setAwayPitcher(e.target.value)}
                disabled={!awayTeam || awayPitchers.length === 0}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '2px solid #ddd',
                  fontSize: '1rem',
                  cursor: awayPitchers.length > 0 ? 'pointer' : 'not-allowed',
                  backgroundColor: awayPitchers.length > 0 ? '#fff' : '#f0f0f0',
                  opacity: awayPitchers.length > 0 ? 1 : 0.5,
                }}
              >
                <option value="">
                  {loading ? '로드 중...' : '투수를 선택하세요'}
                </option>
                {awayPitchers.map((pitcher) => (
                  <option key={pitcher.name} value={pitcher.name}>
                    {pitcher.name} (ERA: {pitcher.era.toFixed(2)}, WHIP: {pitcher.whip.toFixed(2)})
                  </option>
                ))}
              </select>

              {awayPitcher && awayPitchers.find((p) => p.name === awayPitcher) && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0f7ff', borderRadius: '6px' }}>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#333' }}>
                    <strong>선택된 투수:</strong> {awayPitcher}
                  </p>
                  {(() => {
                    const pitcher = awayPitchers.find((p) => p.name === awayPitcher)!;
                    return (
                      <>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                          ERA: {pitcher.era.toFixed(2)} | WHIP: {pitcher.whip.toFixed(2)}
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                          K/BB: {pitcher.kbb.toFixed(2)} | QS: {pitcher.qs}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* 예측 버튼 */}
          <button
            onClick={handlePredict}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: loading ? '#ccc' : '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#764ba2';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#667eea';
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
              }
            }}
          >
            {loading ? '예측 중...' : '🔮 예측 수행'}
          </button>
        </div>

        {/* 예측 결과 */}
        {prediction && (
          <div
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
              📊 예측 결과
            </h2>

            {/* 메인 결과 */}
            <div
              style={{
                backgroundColor: '#f0f7ff',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #667eea',
              }}
            >
              <p style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>
                <strong>경기:</strong> {prediction.homeTeam} ({prediction.homePitcher}) vs {prediction.awayTeam} ({prediction.awayPitcher})
              </p>
              <p style={{ fontSize: '1.3rem', color: '#333', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                🏆 예측 승리팀: <span style={{ color: '#667eea' }}>{prediction.predictedWinner}</span>
              </p>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>
                예측 확률: <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                  {(prediction.predictedProbability * 100).toFixed(1)}%
                </span>
              </p>
            </div>

            {/* 모델별 상세 결과 */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
                🤖 모델별 예측 확률
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {Object.entries(prediction.modelDetails).map(([model, prob]) => (
                  <div
                    key={model}
                    style={{
                      backgroundColor: '#f9f9f9',
                      padding: '1rem',
                      borderRadius: '6px',
                      borderTop: '3px solid #667eea',
                    }}
                  >
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      <strong>{model.toUpperCase()}:</strong>
                    </p>
                    <div style={{ backgroundColor: '#e8eef7', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: '#667eea',
                          height: '100%',
                          width: `${prob * 100}%`,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#333', fontWeight: 'bold' }}>
                      {(prob * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 해석 가이드 */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef9e7', borderRadius: '6px' }}>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                💡 <strong>팁:</strong> 여러 모델의 예측을 앙상블하여 최종 예측을 도출합니다. 각 모델의 확률이 높을수록 더 신뢰할 수 있는 예측입니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}