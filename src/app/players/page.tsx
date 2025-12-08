'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hitter, Pitcher } from '@/types/player'

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
  const router = useRouter()
  const [hitters, setHitters] = useState<Hitter[]>([])
  const [pitchers, setPitchers] = useState<Pitcher[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // 보여줄 선수 수 상태 관리
  const [visibleHittersCount, setVisibleHittersCount] = useState<number>(10)
  const [visiblePitchersCount, setVisiblePitchersCount] = useState<number>(10)

  useEffect(() => {
    fetch('/api/seasonal_hitter_stats')
      .then(res => res.json())
      .then(data => setHitters(Array.isArray(data) ? data : []))

    fetch('/api/seasonal_pitcher_stats')
      .then(res => res.json())
      .then(data => setPitchers(Array.isArray(data) ? data : []))
  }, [])

  // 필터 변경 시 보여줄 선수 수 초기화
  useEffect(() => {
    setVisibleHittersCount(10)
    setVisiblePitchersCount(10)
  }, [searchTerm, selectedTeam])

  const filteredHitters = hitters.filter(h =>
    (searchTerm ? h.이름.includes(searchTerm) : true) &&
    (selectedTeam ? h.팀 === selectedTeam : true)
  )

  const filteredPitchers = pitchers.filter(p =>
    (searchTerm ? p.이름.includes(searchTerm) : true) &&
    (selectedTeam ? p.팀 === selectedTeam : true)
  )

  const handleSelectPlayer = (player: Hitter | Pitcher) => {
    router.push(`/players/${player.ID}`)
  }

  const getTeamLogo = (teamName: string) => {
    const team = teams.find(t => t.code === teamName)
    return team ? team.logo : ''
  }

  // 이닝을 야구 형식(xxx.x)로 변환하는 함수
  // 예: "150 2/3" → 150.2, 150.666 → 150.2
  const convertInnings = (value: any): number | null => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    // 문자열인 경우 분수 형태 체크
    if (typeof value === 'string') {
      // "150 2/3" 또는 "150 1/3" 형태
      const fractionMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)$/)
      if (fractionMatch) {
        const whole = parseInt(fractionMatch[1])
        const numerator = parseInt(fractionMatch[2])
        const denominator = parseInt(fractionMatch[3])

        // 야구 이닝: 1/3 → .1, 2/3 → .2
        if (denominator === 3) {
          return whole + (numerator / 10)
        }
      }
    }

    // 숫자로 변환
    const num = Number(value)
    if (isNaN(num)) {
      return null
    }

    // 소수점이 있는 경우 (예: 150.666...)
    // 소수 부분을 3으로 나눈 나머지로 변환
    const wholeInnings = Math.floor(num)
    const fraction = num - wholeInnings

    // 0.333... → 1아웃 → .1
    // 0.666... → 2아웃 → .2
    if (fraction > 0.001) {
      const outs = Math.round(fraction * 3)
      return wholeInnings + (outs / 10)
    }

    return wholeInnings
  }

  const safeFormatNumber = (value: any, decimals: number = 2, defaultValue: string = '0') => {
    // 빈 문자열이나 공백만 있는 경우 체크
    if (value === '' || (typeof value === 'string' && value.trim() === '')) {
      return defaultValue
    }

    const num = Number(value)
    if (isNaN(num) || value === null || value === undefined) {
      return defaultValue
    }

    // 0인 경우도 체크 (실제로 0인지, 변환 실패로 0인지 구분)
    if (num === 0 && value !== 0 && value !== '0') {
      return defaultValue
    }

    return num.toFixed(decimals)
  }

  // 이닝 전용 포맷팅 함수
  const safeFormatInnings = (value: any, defaultValue: string = '0.0'): string => {
    const innings = convertInnings(value)
    if (innings === null) {
      return defaultValue
    }
    return innings.toFixed(1)
  }


  return (
    <main style={{ padding: '120px 2rem 2rem' }}>
      <h1 className="section-title" style={{ fontSize: '1.6rem' }}>🧾 선수 정보</h1>

      <p style={{ color: 'var(--color-text)', opacity: 0.8, marginBottom: '1rem' }}>
        선수 이름을 검색하여 상세 정보를 확인하세요.
      </p>

      {/* 검색 및 구단 선택 카드 */}
      <section className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '0.8rem' }}>선수 검색</h2>
          <input
            type="text"
            placeholder="선수 이름을 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '1rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text)'
            }}
          />
        </div>

        <h2 className="section-title" style={{ marginBottom: '0.8rem' }}>구단 필터 (선택)</h2>
        <div className="team-logos">
          {teams.map(team => (
            <button
              key={team.code}
              className={`team-logo ${selectedTeam === team.code ? 'selected' : ''}`}
              onClick={() => setSelectedTeam(selectedTeam === team.code ? '' : team.code)}
              aria-pressed={selectedTeam === team.code}
              title={team.name}
            >
              <img src={team.logo} alt={team.name} />
              <span>{team.code}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 검색 결과 목록 */}
      <section className="search-results" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">선수 목록</h2>

        {filteredHitters.length === 0 && filteredPitchers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="loading">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* 타자 목록 */}
            {filteredHitters.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-primary)', paddingLeft: '10px' }}>타자 ({filteredHitters.length}명)</h3>
                <div className="table-scroll">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th style={{ position: 'sticky', left: 0, zIndex: 1 }}>이름</th>
                        <th>팀</th>
                        <th>타율</th>
                        <th>경기</th>
                        <th>타석</th>
                        <th>안타</th>
                        <th>홈런</th>
                        <th>타점</th>
                        <th>득점</th>
                        <th>도루</th>
                        <th>볼넷</th>
                        <th>삼진</th>
                        <th>출루율</th>
                        <th>장타율</th>
                        <th>OPS</th>
                        <th>wRC+</th>
                        <th>WAR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHitters.slice(0, visibleHittersCount).map((h, index) => (
                        <tr
                          key={`h-${h.ID}-${index}`}
                          onClick={() => handleSelectPlayer(h)}
                          style={{ cursor: 'pointer' }}
                          className="hover-row"
                        >
                          <td style={{ fontWeight: 'bold', position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>{h.이름}</td>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getTeamLogo(h.팀) && <img src={getTeamLogo(h.팀)} alt={h.팀} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                            {h.팀}
                          </td>
                          <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{safeFormatNumber(h.타율, 3, '.000')}</td>
                          <td>{h.경기}</td>
                          <td>{h.타석}</td>
                          <td>{h.안타}</td>
                          <td>{h.홈런}</td>
                          <td>{h.타점}</td>
                          <td>{h.득점}</td>
                          <td>{h.도루}</td>
                          <td>{h.볼넷}</td>
                          <td>{h.삼진}</td>
                          <td>{safeFormatNumber(h.출루, 3, '.000')}</td>
                          <td>{safeFormatNumber(h.장타, 3, '.000')}</td>
                          <td style={{ fontWeight: 'bold' }}>{safeFormatNumber(h.OPS, 3, '.000')}</td>
                          <td>{safeFormatNumber(h['wRC+'], 1, '0.0')}</td>
                          <td style={{ fontWeight: 'bold', color: h.WAR >= 0 ? 'var(--color-primary)' : 'inherit' }}>{safeFormatNumber(h.WAR, 2, '0.00')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {visibleHittersCount < filteredHitters.length && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={() => setVisibleHittersCount(prev => prev + 10)}
                      style={{
                        padding: '0.8rem 2rem',
                        fontSize: '1rem',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--color-text)'
                      }}
                    >
                      더 보기 ({Math.min(filteredHitters.length - visibleHittersCount, 10)}명)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 투수 목록 */}
            {filteredPitchers.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', borderLeft: '4px solid #ff6384', paddingLeft: '10px' }}>투수 ({filteredPitchers.length}명)</h3>
                <div className="table-scroll">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th style={{ position: 'sticky', left: 0, zIndex: 1 }}>이름</th>
                        <th>팀</th>
                        <th>평균자책</th>
                        <th>경기</th>
                        <th>승</th>
                        <th>패</th>
                        <th>세이브</th>
                        <th>홀드</th>
                        <th>이닝</th>
                        <th>탈삼진</th>
                        <th>피안타</th>
                        <th>피홈런</th>
                        <th>볼넷</th>
                        <th>QS</th>
                        <th>WHIP</th>
                        <th>WAR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPitchers.slice(0, visiblePitchersCount).map((p, index) => (
                        <tr
                          key={`p-${p.ID}-${index}`}
                          onClick={() => handleSelectPlayer(p)}
                          style={{ cursor: 'pointer' }}
                          className="hover-row"
                        >
                          <td style={{ fontWeight: 'bold', position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>{p.이름}</td>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getTeamLogo(p.팀) && <img src={getTeamLogo(p.팀)} alt={p.팀} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                            {p.팀}
                          </td>
                          <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{safeFormatNumber(p.평균자책, 2, '0.00')}</td>
                          <td>{p.경기}</td>
                          <td>{p.승}</td>
                          <td>{p.패}</td>
                          <td>{p.세이브}</td>
                          <td>{p.홀드}</td>
                          <td>{safeFormatInnings(p.이닝, '0.0')}</td>
                          <td>{p.탈삼진}</td>
                          <td>{p.피안타}</td>
                          <td>{p.피홈런}</td>
                          <td>{p.볼넷}</td>
                          <td>{p.QS}</td>
                          <td>{safeFormatNumber(p.WHIP, 2, '0.00')}</td>
                          <td style={{ fontWeight: 'bold', color: p.WAR >= 0 ? 'var(--color-primary)' : 'inherit' }}>{safeFormatNumber(p.WAR, 2, '0.00')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {visiblePitchersCount < filteredPitchers.length && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={() => setVisiblePitchersCount(prev => prev + 10)}
                      style={{
                        padding: '0.8rem 2rem',
                        fontSize: '1rem',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--color-text)'
                      }}
                    >
                      더 보기 ({Math.min(filteredPitchers.length - visiblePitchersCount, 10)}명)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}