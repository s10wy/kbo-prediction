// src/app/players/page.tsx
'use client'
import React, { useEffect, useState } from 'react'

// 타자
type Hitter = {
  ID: number
  이름: string
  팀: string
  시즌: string
  경기: number
  타석: number
  안타: number
  홈런: number
  타점: number
}

// 투수
type Pitcher = {
  ID: number
  이름: string
  팀: string
  시즌: string
  경기: number
  평균자책: number
  승: number
  패: number
  세이브: number
}

// 구단
const teams = [
  { code: '두산', name: '두산 베어스', logo: '/teams/두산.png' },
  { code: '삼성', name: '삼성 라이온즈', logo: '/teams/삼성.png' },
  { code: 'KIA', name: 'KIA 타이거즈', logo: '/teams/KIA.png' },
  { code: '롯데', name: '롯데 자이언츠', logo: '/teams/롯데.png' },
  { code: 'NC', name: 'NC 다이노스', logo: '/teams/NC.png' },
  { code: '한화', name: '한화 이글스', logo: '/teams/한화.png' },
  { code: 'LG', name: 'LG 트윈스', logo: '/teams/LG.png' },
  { code: 'SSG', name: 'SSG 랜더스', logo: '/teams/SSG.png' },
  { code: 'KT', name: 'KT 위즈', logo: '/teams/KT.png' },
  { code: '키움', name: '키움 히어로즈', logo: '/teams/키움.png' }
]

export default function PlayersPage() {
  const [hitters, setHitters] = useState<Hitter[]>([])
  const [pitchers, setPitchers] = useState<Pitcher[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')

  useEffect(() => {
    fetch('/api/seasonal_hitter_stats')
      .then(res => res.json())
      .then(data => setHitters(Array.isArray(data) ? data : []))

    fetch('/api/seasonal_pitcher_stats')
      .then(res => res.json())
      .then(data => setPitchers(Array.isArray(data) ? data : []))
  }, [])

  const filteredHitters = selectedTeam ? hitters.filter(h => h.팀 === selectedTeam) : []
  const filteredPitchers = selectedTeam ? pitchers.filter(p => p.팀 === selectedTeam) : []

  return (
    <main style={{ padding: '120px 2rem 2rem' }}>
      <h1 className="section-title" style={{ fontSize: '1.6rem' }}>🧾 선수 정보</h1>
      <p style={{ color: 'var(--color-text)', opacity: 0.8, marginBottom: '1rem' }}>
        구단 로고를 선택하면 해당 팀의 타자/투수 기록이 표시됩니다.
      </p>

      {/* 구단 선택 카드 */}
      <section className="card">
        <h2 className="section-title" style={{ marginBottom: '0.8rem' }}>구단 선택</h2>
        <div className="team-logos">
          {teams.map(team => (
            <button
              key={team.code}
              className={`team-logo ${selectedTeam === team.code ? 'selected' : ''}`}
              onClick={() => setSelectedTeam(team.code)}
              aria-pressed={selectedTeam === team.code}
              title={team.name}
            >
              <img src={team.logo} alt={team.name} />
              <span>{team.code}</span>
            </button>
          ))}
        </div>
        <div className="team-actions">
          <button
            className="clear-btn"
            onClick={() => setSelectedTeam('')}
            aria-label="선택 해제"
            title="선택 해제"
          >
            선택 해제
          </button>
        </div>
      </section>

      {/* 기록 표 영역 */}
      {selectedTeam ? (
        <section className="tables-wrap">
          {/* 타자 표 */}
          <div className="card">
            <h3 className="section-title">타자 ({selectedTeam})</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>경기</th>
                    <th>타석</th>
                    <th>안타</th>
                    <th>홈런</th>
                    <th>타점</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHitters.length > 0 ? (
                    filteredHitters.map(h => (
                      <tr key={h.ID}>
                        <td>{h.이름}</td>
                        <td>{h.경기}</td>
                        <td>{h.타석}</td>
                        <td>{h.안타}</td>
                        <td>{h.홈런}</td>
                        <td>{h.타점}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="loading">기록 없음</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 투수 표 */}
          <div className="card">
            <h3 className="section-title">투수 ({selectedTeam})</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>경기</th>
                    <th>평균자책</th>
                    <th>승</th>
                    <th>패</th>
                    <th>세이브</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPitchers.length > 0 ? (
                    filteredPitchers.map(p => (
                      <tr key={p.ID}>
                        <td>{p.이름}</td>
                        <td>{p.경기}</td>
                        <td>{p.평균자책}</td>
                        <td>{p.승}</td>
                        <td>{p.패}</td>
                        <td>{p.세이브}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="loading">기록 없음</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p className="loading">상단에서 구단을 선택해주세요.</p>
        </div>
      )}
    </main>
  )
}
