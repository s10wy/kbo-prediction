// src/app/predict/page.tsx
// 승부 예측 페이지
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Prediction = {
  gameId: string;
  날짜: string;
  구장: string;
  홈팀: string;
  홈점수: number;
  원정팀: string;
  원정점수: number;
  승리팀: string;
  예측승리팀: string;
  예측확률: number;
};

export default function PredictPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/predict');
        if (!response.ok) {
          throw new Error('예측 데이터를 불러올 수 없습니다.');
        }
        const data = await response.json();
        setPredictions(data.predictions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  // 팀 필터링
  const filteredPredictions = selectedTeam
    ? predictions.filter(
        (p) =>
          p.홈팀 === selectedTeam ||
          p.원정팀 === selectedTeam
      )
    : predictions;

  // 정확도 계산
  const correctPredictions = predictions.filter(
    (p) => p.예측승리팀 === p.승리팀 && p.승리팀
  ).length;
  const accuracy =
    predictions.length > 0
      ? ((correctPredictions / predictions.length) * 100).toFixed(2)
      : '0.00';

  return (
    <main style={{ padding: '120px 2rem 2rem' }}>
      {/* ⭐ 페이지 헤더 + 우상단 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.7rem', marginBottom: '0.5rem' }}>
            🔮 누적 승부 예측
          </h1>
          <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>
            AI 모델을 활용한 경기 결과 예측
          </p>
        </div>
        
        {/* ⭐ "예측 하러 가기" 버튼 */}
        <Link href="/predict-real-time" style={{ textDecoration: 'none' }}>
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
            📊 예측 하러 가기
          </button>
        </Link>
      </div>
      
      {/* 통계 요약 */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">📊 예측 통계</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginTop: '1rem',
          }}
        >
          <div>
            <h3 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>
              예측 기간
            </h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {predictions.length > 0 ? `${predictions[0].날짜} ~ ${predictions[predictions.length - 1].날짜}`  : '-'}
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>
              총 경기 수
            </h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {predictions.length}
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>
              정확한 예측
            </h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {correctPredictions}
            </p>
          </div>
          <div>
            <h3 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>
              예측 정확도
            </h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>
              {accuracy}%
            </p>
          </div>
        </div>
      </section>

      {/* 팀 필터 */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">🏠 팀별 필터</h2>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-card-border)',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          <option value="">전체 경기</option>
          <option value="LG">LG 트윈스</option>
          <option value="두산">두산 베어스</option>
          <option value="KIA">KIA 타이거즈</option>
          <option value="삼성">삼성 라이온즈</option>
          <option value="롯데">롯데 자이언츠</option>
          <option value="한화">한화 이글스</option>
          <option value="NC">NC 다이노스</option>
          <option value="SSG">SSG 랜더스</option>
          <option value="KT">KT 위즈</option>
          <option value="키움">키움 히어로즈</option>
        </select>
      </section>

      {/* 로딩 / 에러 상태 */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="loading">예측 데이터를 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="error">{error}</p>
        </div>
      )}

      {/* 예측 결과 테이블 */}
      {!loading && !error && (
        <section className="card">
          <h2 className="section-title">⚾ 경기 예측 결과</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>구장</th>
                  <th>홈팀</th>
                  <th>vs</th>
                  <th>원정팀</th>
                  <th>스코어</th>
                  <th>실제 승자</th>
                  <th>🤖 예측 승자</th>
                  <th>신뢰도</th>
                  <th>결과</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.length > 0 ? (
                  filteredPredictions.map((pred) => {
                    const isCorrect =
                      pred.예측승리팀 === pred.승리팀 && pred.승리팀;
                    const resultColor = isCorrect ? '#10b981' : '#ef4444';

                    return (
                      <tr key={pred.gameId}>
                        <td>{pred.날짜}</td>
                        <td>{pred.구장}</td>
                        <td>{pred.홈팀}</td>
                        <td>vs</td>
                        <td>{pred.원정팀}</td>
                        <td>
                          {pred.홈점수} : {pred.원정점수}
                        </td>
                        <td>{pred.승리팀 || '진행중'}</td>
                        <td style={{ fontWeight: 'bold' }}>
                          {pred.예측승리팀}
                        </td>
                        <td>
                          <div
                            style={{
                              width: '60px',
                              height: '24px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                          >
                            <div
                              style={{
                                width: `${pred.예측확률 * 100}%`,
                                height: '100%',
                                backgroundColor: '#60a5fa',
                                transition: 'width 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                color: '#fff',
                                fontWeight: 'bold',
                              }}
                            >
                              {(pred.예측확률 * 100).toFixed(0)}%
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            color: resultColor,
                            fontWeight: 'bold',
                          }}
                        >
                          {isCorrect ? '✅ 맞음' : '❌ 틀림'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="loading">
                      {selectedTeam
                        ? `${selectedTeam}의 경기 데이터가 없습니다.`
                        : '예측 데이터가 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 설명 */}
      <section className="card" style={{ marginTop: '2rem' }}>
        <h3 className="section-title">📌 예측 정보</h3>
        <ul style={{ lineHeight: '1.8', color: 'var(--color-text)' }}>
          <li>
            <strong>모델:</strong> Stacking 앙상블 (Logistic + XGBoost)
          </li>
          <li>
            <strong>학습 데이터:</strong> 2009-2024년 KBO 경기 데이터
          </li>
          <li>
            <strong>예측 정확도:</strong> 약 56-57% (상황에 따라 변동)
          </li>
          <li>
            <strong>신뢰도:</strong> 0-100% (높을수록 신뢰도 높음)
          </li>
          <li>
            <strong>업데이트:</strong> 정기적으로 새 데이터 반영 (현재: 2025년 3-5월)
          </li>
        </ul>
      </section>
    </main>
  );
}
