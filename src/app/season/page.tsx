// src/app/season/page.tsx

'use client';
import React, { useEffect, useState } from 'react';

// ✅ 팀 순위 데이터 타입
type TeamRank = {
  rank: number;
  team: string;
  played: number;
  win: number;
  lose: number;
  draw: number;
  win_rate: string;
  batting_rate: number;
  pitching_rate: number;
};

// ✅ 경기 일정/결과 타입
type Game = {
  date: string;
  match: string;
  result: string;
};

export default function SeasonPage() {
  const [ranks, setRanks] = useState<TeamRank[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 시즌 목록 가져오기
    fetch('/api/seasons')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSeasons(data);
          setSelectedSeason(data[0]); // 가장 최신 시즌 기본 선택
        }
      })
      .catch(err => console.error('Failed to load seasons', err));
  }, []);

  useEffect(() => {
    // 경기 일정 / 결과 (항상 표시)
    fetch('/api/today_games')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGames(data);
        } else if (Array.isArray(data.items)) {
          setGames(data.items);
        } else {
          setGames([]);
        }
      })
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;

    // 팀 순위 API
    fetch(`/api/team_ranks?year=${selectedSeason}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRanks(data);
        } else if (Array.isArray(data.items)) {
          setRanks(data.items);
        } else {
          setError('팀 순위 데이터를 불러올 수 없습니다.');
        }
      })
      .catch(() => setError('팀 순위 데이터를 불러올 수 없습니다.'));
  }, [selectedSeason]);

  // ✅ 소수점 3자리 포맷팅 함수
  const formatDecimal = (value: number): string => {
    return typeof value === 'number' ? value.toFixed(3) : '-';
  };

  return (
    <main style={{ paddingTop: '120px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.7rem', marginBottom: 0 }}>
          KBO 시즌 정보
        </h1>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text)',
            cursor: 'pointer'
          }}
        >
          {seasons.map(year => (
            <option key={year} value={year}>{year} 시즌</option>
          ))}
        </select>
      </div>
      <p style={{ color: 'var(--color-text)', opacity: 0.8, marginBottom: '1.5rem' }}>
        팀 순위, 경기 결과, 시즌 통계를 한눈에 확인해보세요.
      </p>

      {/* ✅ 팀 순위 테이블 */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">팀 순위</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>순위</th>
                <th>팀명</th>
                <th>경기수</th>
                <th>승</th>
                <th>패</th>
                <th>무</th>
                <th>승률</th>
                <th>팀타율</th>
                <th>팀방어율</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={9} className="error">{error}</td>
                </tr>
              ) : ranks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="loading">데이터 불러오는 중...</td>
                </tr>
              ) : (
                ranks.map((t) => (
                  <tr key={t.rank}>
                    <td>{t.rank}</td>
                    <td>{t.team}</td>
                    <td>{t.played}</td>
                    <td>{t.win}</td>
                    <td>{t.lose}</td>
                    <td>{t.draw}</td>
                    <td>{t.win_rate}</td>
                    <td>{formatDecimal(t.batting_rate)}</td>
                    <td>{formatDecimal(t.pitching_rate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ✅ 오늘의 경기 결과 (항상 표시) */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">오늘의 경기 결과</h2>
        {games.length === 0 ? (
          <p className="loading">오늘 경기 정보가 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>경기</th>
                <th>결과</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g, i) => (
                <tr key={i}>
                  <td>{g.date}</td>
                  <td>{g.match}</td>
                  <td>{g.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}