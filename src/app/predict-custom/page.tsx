// src/app/predict-custom/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
}

interface Pitcher {
  id: string;
  name: string;
  team: string;
  era: number;
  whip: number;
}

interface PredictionResult {
  homeTeam: string;
  awayTeam: string;
  homePitcher: string;
  awayPitcher: string;
  predictedWinner: string;
  probability: number;
  confidence: string;
  timestamp: string;
}

export default function PredictRealTimePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  // 폼 상태
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homePitcher, setHomePitcher] = useState('');
  const [awayPitcher, setAwayPitcher] = useState('');

  // 결과 상태
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');
  const [predictionHistory, setPredictionHistory] = useState<PredictionResult[]>([]);

  // 데이터 로드
  useEffect(() => {
    fetchTeamsAndPitchers();
  }, []);

  const fetchTeamsAndPitchers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams-and-pitchers');
      const data = await response.json();
      
      if (data.teams) setTeams(data.teams);
      if (data.pitchers) setPitchers(data.pitchers);
    } catch (err) {
      setError('팀과 투수 정보를 불러올 수 없습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 예측 수행
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPrediction(null);

    // 유효성 검사
    if (!homeTeam || !awayTeam || !homePitcher || !awayPitcher) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (homeTeam === awayTeam) {
      setError('홈 팀과 상대 팀이 같을 수 없습니다.');
      return;
    }

    try {
      setPredicting(true);

      const response = await fetch('/api/predict-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeam,
          awayTeam,
          homePitcher,
          awayPitcher,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '예측에 실패했습니다.');
        return;
      }

      const result: PredictionResult = {
        homeTeam,
        awayTeam,
        homePitcher,
        awayPitcher,
        predictedWinner: data.predictions[0]?.예측승리팀 || '불명',
        probability: data.predictions[0]?.예측확률 || 0,
        confidence:
          (data.predictions[0]?.예측확률 || 0) > 0.55
            ? '높음'
            : (data.predictions[0]?.예측확률 || 0) > 0.5
            ? '보통'
            : '낮음',
        timestamp: new Date().toLocaleTimeString('ko-KR'),
      };

      setPrediction(result);
      setPredictionHistory([result, ...predictionHistory.slice(0, 9)]);
    } catch (err) {
      setError('예측 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case '높음':
        return '#10b981';
      case '보통':
        return '#f59e0b';
      case '낮음':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getProbabilityPercentage = (prob: number) => {
    return Math.round(prob * 100);
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
      {/* 헤더 */}
      <section
        style={{
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🔮 실시간 경기 예측
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
          팀과 선발 투수를 선택하고 경기 결과를 예측해보세요
        </p>
      </section>

      {/* 메인 컨텐츠 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* 예측 폼 */}
          <div
            style={{
              padding: '2rem',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
              ⚾ 예측 설정
            </h2>

            <form onSubmit={handlePredict}>
              {/* 홈 팀 선택 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '0.95rem',
                  }}
                >
                  🏠 홈 팀
                </label>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #667eea',
                    fontSize: '1rem',
                    backgroundColor: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <option value="">팀 선택...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 홈 투수 선택 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '0.95rem',
                  }}
                >
                  👤 홈 팀 선발 투수
                </label>
                <select
                  value={homePitcher}
                  onChange={(e) => setHomePitcher(e.target.value)}
                  disabled={loading || !homeTeam}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #667eea',
                    fontSize: '1rem',
                    backgroundColor: '#fff',
                    cursor: loading || !homeTeam ? 'not-allowed' : 'pointer',
                    opacity: loading || !homeTeam ? 0.6 : 1,
                  }}
                >
                  <option value="">투수 선택...</option>
                  {pitchers
                    .filter((p) => p.team === homeTeam)
                    .map((pitcher) => (
                      <option key={pitcher.id} value={pitcher.name}>
                        {pitcher.name} (ERA: {pitcher.era.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>

              {/* 상대 팀 선택 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '0.95rem',
                  }}
                >
                  ✈️ 상대 팀
                </label>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #764ba2',
                    fontSize: '1rem',
                    backgroundColor: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <option value="">팀 선택...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 상대 투수 선택 */}
              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '0.95rem',
                  }}
                >
                  👤 상대 팀 선발 투수
                </label>
                <select
                  value={awayPitcher}
                  onChange={(e) => setAwayPitcher(e.target.value)}
                  disabled={loading || !awayTeam}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #764ba2',
                    fontSize: '1rem',
                    backgroundColor: '#fff',
                    cursor: loading || !awayTeam ? 'not-allowed' : 'pointer',
                    opacity: loading || !awayTeam ? 0.6 : 1,
                  }}
                >
                  <option value="">투수 선택...</option>
                  {pitchers
                    .filter((p) => p.team === awayTeam)
                    .map((pitcher) => (
                      <option key={pitcher.id} value={pitcher.name}>
                        {pitcher.name} (ERA: {pitcher.era.toFixed(2)})
                      </option>
                    ))}
                </select>
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
                  ⚠️ {error}
                </div>
              )}

              {/* 예측 버튼 */}
              <button
                type="submit"
                disabled={predicting || loading || !homeTeam || !awayTeam || !homePitcher || !awayPitcher}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: predicting ? '#9ca3af' : '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: predicting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: predicting ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!predicting)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5a67d8';
                }}
                onMouseOut={(e) => {
                  if (!predicting)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#667eea';
                }}
              >
                {predicting ? '⏳ 예측 중...' : '🔮 예측 실행'}
              </button>
            </form>
          </div>

          {/* 예측 결과 */}
          {prediction && (
            <div
              style={{
                padding: '2rem',
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
                📊 예측 결과
              </h2>

              {/* 매치업 정보 */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                  {prediction.homeTeam} vs {prediction.awayTeam}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>
                  {prediction.homePitcher} vs {prediction.awayPitcher}
                </div>
              </div>

              {/* 예측 승리팀 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>
                  예측 승리팀
                </h3>
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: '#667eea',
                  }}
                >
                  {prediction.predictedWinner}
                </div>
              </div>

              {/* 승리 확률 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>
                  승리 확률
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      flex: 1,
                      height: '30px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '15px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${getProbabilityPercentage(prediction.probability)}%`,
                        backgroundColor: '#667eea',
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {getProbabilityPercentage(prediction.probability) > 20 &&
                        `${getProbabilityPercentage(prediction.probability)}%`}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333', minWidth: '60px' }}>
                    {getProbabilityPercentage(prediction.probability)}%
                  </div>
                </div>
              </div>

              {/* 신뢰도 */}
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>
                  신뢰도
                </h3>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    backgroundColor: getConfidenceColor(prediction.confidence),
                    color: '#fff',
                    borderRadius: '20px',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                  }}
                >
                  {prediction.confidence}
                </div>
              </div>

              {/* 시간 */}
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '1rem' }}>
                🕐 예측 시간: {prediction.timestamp}
              </div>
            </div>
          )}
        </div>

        {/* 예측 히스토리 */}
        {predictionHistory.length > 0 && (
          <div
            style={{
              marginTop: '2rem',
              padding: '2rem',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
              📜 예측 히스토리
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #667eea' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>
                      경기
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>
                      예측 승리팀
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>
                      확률
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>
                      신뢰도
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>
                      시간
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {predictionHistory.map((pred, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                      }}
                    >
                      <td style={{ padding: '1rem', color: '#333', fontSize: '0.9rem' }}>
                        {pred.homeTeam} vs {pred.awayTeam}
                      </td>
                      <td style={{ padding: '1rem', color: '#333', fontWeight: 'bold' }}>
                        {pred.predictedWinner}
                      </td>
                      <td style={{ padding: '1rem', color: '#667eea', fontWeight: 'bold' }}>
                        {getProbabilityPercentage(pred.probability)}%
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: getConfidenceColor(pred.confidence),
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {pred.confidence}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#999', fontSize: '0.85rem' }}>
                        {pred.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 기본 예측으로 돌아가기 */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/predict" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#764ba2',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6d3fa0';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#764ba2';
              }}
            >
              📊 기본 예측으로 이동
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}