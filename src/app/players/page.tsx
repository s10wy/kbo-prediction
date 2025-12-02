// src/app/players/page.tsx
// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// 타자
type Hitter = {
  ID: number
  이름: string
  팀: string
  포지션: string
  선수이미지: string
  시즌: string
  경기: number
  타석: number
  안타: number
  홈런: number
  타점: number
  득점: number
  '2타': number
  '3타': number
  도루: number
  볼넷: number
  사구: number
  삼진: number
  타율: number
  출루: number
  장타: number
  OPS: number
  IsoP: number
  BABIP: number
  wOBA: number
  'wRC+': number
  WAR: number
}

// 투수
type Pitcher = {
  ID: number
  이름: string
  팀: string
  선수이미지: string
  시즌: string
  경기: number
  평균자책: number
  승: number
  패: number
  세이브: number
  홀드: number
  이닝: number
  탈삼진: number
  피안타: number
  피홈런: number
  실점: number
  자책점: number
  볼넷: number
  사구: number
  QS: number
  WHIP: number
  'K/9': number
  'BB/9': number
  'K/BB': number
  'K%': number
  WPA: number
  WAR: number
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

// 비율 스탯 정의
const RATE_STATS = [
  '타율', '출루', '장타', 'OPS', 'IsoP', 'BABIP', 'wOBA', 'WAR',
  '평균자책', 'WHIP', 'K/9', 'BB/9', 'K/BB', 'K%', 'WPA'
];

// 차트 컴포넌트
function PlayerStatsChart({ player, averages, isHitter }: { player: Hitter | Pitcher, averages: any, isHitter: boolean }) {
  // 초기 선택 스탯 (기본값)
  const defaultStats = isHitter
    ? ['타율', '출루', '장타', 'OPS', '홈런', '안타']
    : ['평균자책', 'WHIP', '승', '탈삼진', '이닝'];

  const [selectedStats, setSelectedStats] = useState<string[]>(defaultStats);
  const [statSearch, setStatSearch] = useState('');

  useEffect(() => {
    const defaultStats = isHitter
      ? ['타율', '출루', '장타', 'OPS', '홈런', '안타']
      : ['평균자책', 'WHIP', '승', '탈삼진', '이닝'];

    setSelectedStats(defaultStats);
  }, [player, isHitter]);


  if (!averages) return null;

  // 모든 가능한 스탯 목록
  const allStats = isHitter
    ? ['경기', '타석', '안타', '홈런', '타점', '득점', '2타', '3타', '도루', '볼넷', '사구', '삼진', '타율', '출루', '장타', 'OPS', 'IsoP', 'BABIP', 'wOBA', 'wRC+', 'WAR']
    : ['경기', '평균자책', '승', '패', '세이브', '홀드', '이닝', '탈삼진', '피안타', '피홈런', '실점', '자책점', '볼넷', '사구', 'QS', 'WHIP', 'K/9', 'BB/9', 'K/BB', 'K%', 'WPA', 'WAR'];

  // 검색 필터링
  const availableStats = allStats.filter(s =>
    !selectedStats.includes(s) && s.includes(statSearch)
  );

  const toggleStat = (stat: string) => {
    if (selectedStats.includes(stat)) {
      setSelectedStats(selectedStats.filter(s => s !== stat));
    } else {
      setSelectedStats([...selectedStats, stat]);
    }
  };

  // 데이터 분류 (Counts vs Rates)
  const countStats = selectedStats.filter(s => !RATE_STATS.includes(s));
  const rateStats = selectedStats.filter(s => RATE_STATS.includes(s));

  // 데이터셋 생성 헬퍼
  const createChartData = (stats: string[], labelSuffix: string) => {
    const playerValues = stats.map(key => {
      const val = (player as any)[key];
      return val !== undefined ? Number(val) : 0;
    });
    const avgValues = stats.map(key => {
      const val = averages[key];
      return val !== undefined ? Number(val) : 0;
    });

    return {
      labels: stats,
      datasets: [
        {
          label: `${player.이름}`,
          data: playerValues,
          backgroundColor: 'rgba(53, 162, 235, 0.7)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: '리그 평균',
          data: avgValues,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  const countData = createChartData(countStats, '(누적)');
  const rateData = createChartData(rateStats, '(비율)');

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{
      maxWidth: '1200px', // 차트 영역 확대
      margin: '0 auto 2rem',
      padding: '2.5rem',
      background: '#fff',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
        📊 상세 기록 분석
      </h2>

      {/* 누적 기록 차트 */}
      {countStats.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#444', borderLeft: '4px solid var(--color-primary)', paddingLeft: '10px' }}>
            누적 기록 (Counts)
          </h3>
          <div style={{ height: '500px' }}> {/* 높이 확대 */}
            <Bar data={countData} options={{
              ...commonOptions,
              plugins: { ...commonOptions.plugins, title: { display: false } }
            }} />
          </div>
        </div>
      )}

      {/* 비율 기록 차트 */}
      {rateStats.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#444', borderLeft: '4px solid #ff6384', paddingLeft: '10px' }}>
            비율 기록 (Rates)
          </h3>
          <div style={{ height: '500px' }}> {/* 높이 확대 */}
            <Bar data={rateData} options={{
              ...commonOptions,
              plugins: { ...commonOptions.plugins, title: { display: false } }
            }} />
          </div>
        </div>
      )}

      {/* 컨트롤 영역 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
          ⚙️ 차트 설정
        </h3>

        {/* 검색창 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="스탯 검색 (예: 타율, 홈런, 삼진...)"
            value={statSearch}
            onChange={(e) => setStatSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #ced4da',
              fontSize: '1.1rem'
            }}
          />
        </div>

        {/* 선택된 스탯 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.8rem' }}>현재 표시 중 (클릭하여 제거):</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {selectedStats.map(stat => (
              <button
                key={stat}
                onClick={() => toggleStat(stat)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '30px',
                  border: '1px solid var(--color-primary)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                {stat} <span style={{ opacity: 0.7 }}>×</span>
              </button>
            ))}
          </div>
        </div>

        {/* 추가 가능한 스탯 */}
        <div>
          <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.8rem' }}>추가 가능 (클릭하여 추가):</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {availableStats.length > 0 ? availableStats.map(stat => (
              <button
                key={stat}
                onClick={() => toggleStat(stat)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '30px',
                  border: '1px solid #ced4da',
                  backgroundColor: '#fff',
                  color: '#495057',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
              >
                + {stat}
              </button>
            )) : (
              <span style={{ color: '#adb5bd', fontSize: '1rem' }}>검색 결과가 없습니다.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const [hitters, setHitters] = useState<Hitter[]>([])
  const [pitchers, setPitchers] = useState<Pitcher[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedPlayer, setSelectedPlayer] = useState<Hitter | Pitcher | null>(null)

  useEffect(() => {
    fetch('/api/seasonal_hitter_stats')
      .then(res => res.json())
      .then(data => setHitters(Array.isArray(data) ? data : []))

    fetch('/api/seasonal_pitcher_stats')
      .then(res => res.json())
      .then(data => setPitchers(Array.isArray(data) ? data : []))
  }, [])

  const filteredHitters = hitters.filter(h =>
    (searchTerm ? h.이름.includes(searchTerm) : true) &&
    (selectedTeam ? h.팀 === selectedTeam : true)
  )

  const filteredPitchers = pitchers.filter(p =>
    (searchTerm ? p.이름.includes(searchTerm) : true) &&
    (selectedTeam ? p.팀 === selectedTeam : true)
  )

  const handleSelectPlayer = (player: Hitter | Pitcher) => {
    setSelectedPlayer(player)
  }

  const handleBackToSearch = () => {
    setSelectedPlayer(null)
  }

  // Helper to check if player is Hitter
  const isHitter = (player: Hitter | Pitcher): player is Hitter => {
    return (player as Hitter).타석 !== undefined
  }

  const formatStat = (value: number | string | undefined | null, key?: string) => {
    if (value === undefined || value === null) return '-'
    const num = Number(value)
    if (isNaN(num)) return '-'

    // Integer stats (counting stats)
    const integerStats = [
      '경기', '타석', '안타', '홈런', '타점', '득점', '2타', '3타', '도루', '볼넷', '사구', '삼진', 'wRC+',
      '승', '패', '세이브', '홀드', '탈삼진', '피안타', '피홈런', '실점', '자책점', 'QS'
    ]

    if (key && integerStats.includes(key)) {
      return Math.round(num).toString()
    }

    return Number(num.toFixed(3))
  }

  const calculateAverage = (data: any[], key: string) => {
    if (!data || data.length === 0) return 0
    const sum = data.reduce((acc, curr) => {
      const val = Number(curr[key])
      return acc + (isNaN(val) ? 0 : val)
    }, 0)
    return sum / data.length
  }

  const hitterAverages = React.useMemo(() => {
    if (hitters.length === 0) return null
    const keys = ['경기', '타석', '안타', '홈런', '타점', '득점', '2타', '3타', '도루', '볼넷', '사구', '삼진', '타율', '출루', '장타', 'OPS', 'IsoP', 'BABIP', 'wOBA', 'wRC+', 'WAR']
    const avgs: any = {}
    keys.forEach(key => {
      avgs[key] = calculateAverage(hitters, key)
    })
    return avgs
  }, [hitters])

  const pitcherAverages = React.useMemo(() => {
    if (pitchers.length === 0) return null
    const keys = ['경기', '평균자책', '승', '패', '세이브', '홀드', '이닝', '탈삼진', '피안타', '피홈런', '실점', '자책점', '볼넷', '사구', 'QS', 'WHIP', 'K/9', 'BB/9', 'K/BB', 'K%', 'WPA', 'WAR']
    const avgs: any = {}
    keys.forEach(key => {
      avgs[key] = calculateAverage(pitchers, key)
    })
    return avgs
  }, [pitchers])

  return (
    <main style={{ padding: '120px 2rem 2rem' }}>
      <h1 className="section-title" style={{ fontSize: '1.6rem' }}>🧾 선수 정보</h1>

      {!selectedPlayer ? (
        <>
          <p style={{ color: 'var(--color-text)', opacity: 0.8, marginBottom: '1rem' }}>
            선수 이름을 검색하여 목록에서 선택하세요.
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {filteredHitters.map((h, i) => (
                  <button
                    key={`h-${h.ID}-${i}`}
                    className="card player-card"
                    onClick={() => handleSelectPlayer(h)}
                    style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.2s' }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{h.이름}</div>
                    <div style={{ color: 'var(--color-text)', opacity: 0.8 }}>{h.팀} | {h.포지션}</div>
                  </button>
                ))}
                {filteredPitchers.map((p, i) => (
                  <button
                    key={`p-${p.ID}-${i}`}
                    className="card player-card"
                    onClick={() => handleSelectPlayer(p)}
                    style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.2s' }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.이름}</div>
                    <div style={{ color: 'var(--color-text)', opacity: 0.8 }}>{p.팀} | 투수</div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="player-detail">
          <button
            onClick={handleBackToSearch}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)',
              cursor: 'pointer'
            }}
          >
            ← 검색 결과로 돌아가기
          </button>

          <div className="card">
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {selectedPlayer.선수이미지 && (
                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                  <Image
                    src={selectedPlayer.선수이미지}
                    alt={selectedPlayer.이름}
                    fill
                    style={{ objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--color-primary)' }}
                    onError={(e) => {
                      // Fallback logic if needed
                    }}
                  />
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedPlayer.이름}</h2>
                <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                  {selectedPlayer.팀} | {isHitter(selectedPlayer) ? selectedPlayer.포지션 : '투수'}
                </p>
              </div>
            </div>

            {/* 차트 섹션 */}
            <PlayerStatsChart
              player={selectedPlayer}
              averages={isHitter(selectedPlayer) ? hitterAverages : pitcherAverages}
              isHitter={isHitter(selectedPlayer)}
            />

            <h3 className="section-title">시즌 기록 비교</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  {isHitter(selectedPlayer) ? (
                    <tr>
                      <th style={{ minWidth: '80px', position: 'sticky', left: 0, zIndex: 1 }}>구분</th>
                      <th>경기</th>
                      <th>타석</th>
                      <th>안타</th>
                      <th>홈런</th>
                      <th>타점</th>
                      <th>득점</th>
                      <th>2루타</th>
                      <th>3루타</th>
                      <th>도루</th>
                      <th>볼넷</th>
                      <th>사구</th>
                      <th>삼진</th>
                      <th>타율</th>
                      <th>출루율</th>
                      <th>장타율</th>
                      <th>OPS</th>
                      <th>IsoP</th>
                      <th>BABIP</th>
                      <th>wOBA</th>
                      <th>wRC+</th>
                      <th>WAR</th>
                    </tr>
                  ) : (
                    <tr>
                      <th style={{ minWidth: '80px', position: 'sticky', left: 0, zIndex: 1 }}>구분</th>
                      <th>경기</th>
                      <th>평균자책</th>
                      <th>승</th>
                      <th>패</th>
                      <th>세이브</th>
                      <th>홀드</th>
                      <th>이닝</th>
                      <th>탈삼진</th>
                      <th>피안타</th>
                      <th>피홈런</th>
                      <th>실점</th>
                      <th>자책점</th>
                      <th>볼넷</th>
                      <th>사구</th>
                      <th>QS</th>
                      <th>WHIP</th>
                      <th>K/9</th>
                      <th>BB/9</th>
                      <th>K/BB</th>
                      <th>K%</th>
                      <th>WPA</th>
                      <th>WAR</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {isHitter(selectedPlayer) ? (
                    <>
                      <tr>
                        <td style={{ fontWeight: 'bold', position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>선수 기록</td>
                        <td>{formatStat(selectedPlayer.경기, '경기')}</td>
                        <td>{formatStat(selectedPlayer.타석, '타석')}</td>
                        <td>{formatStat(selectedPlayer.안타, '안타')}</td>
                        <td>{formatStat(selectedPlayer.홈런, '홈런')}</td>
                        <td>{formatStat(selectedPlayer.타점, '타점')}</td>
                        <td>{formatStat(selectedPlayer.득점, '득점')}</td>
                        <td>{formatStat(selectedPlayer['2타'], '2타')}</td>
                        <td>{formatStat(selectedPlayer['3타'], '3타')}</td>
                        <td>{formatStat(selectedPlayer.도루, '도루')}</td>
                        <td>{formatStat(selectedPlayer.볼넷, '볼넷')}</td>
                        <td>{formatStat(selectedPlayer.사구, '사구')}</td>
                        <td>{formatStat(selectedPlayer.삼진, '삼진')}</td>
                        <td>{formatStat(selectedPlayer.타율, '타율')}</td>
                        <td>{formatStat(selectedPlayer.출루, '출루')}</td>
                        <td>{formatStat(selectedPlayer.장타, '장타')}</td>
                        <td>{formatStat(selectedPlayer.OPS, 'OPS')}</td>
                        <td>{formatStat(selectedPlayer.IsoP, 'IsoP')}</td>
                        <td>{formatStat(selectedPlayer.BABIP, 'BABIP')}</td>
                        <td>{formatStat(selectedPlayer.wOBA, 'wOBA')}</td>
                        <td>{formatStat(selectedPlayer['wRC+'], 'wRC+')}</td>
                        <td>{formatStat(selectedPlayer.WAR, 'WAR')}</td>
                      </tr>
                      {hitterAverages && (
                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                          <td style={{ fontWeight: 'bold', position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>리그 평균</td>
                          <td>{formatStat(hitterAverages.경기, '경기')}</td>
                          <td>{formatStat(hitterAverages.타석, '타석')}</td>
                          <td>{formatStat(hitterAverages.안타, '안타')}</td>
                          <td>{formatStat(hitterAverages.홈런, '홈런')}</td>
                          <td>{formatStat(hitterAverages.타점, '타점')}</td>
                          <td>{formatStat(hitterAverages.득점, '득점')}</td>
                          <td>{formatStat(hitterAverages['2타'], '2타')}</td>
                          <td>{formatStat(hitterAverages['3타'], '3타')}</td>
                          <td>{formatStat(hitterAverages.도루, '도루')}</td>
                          <td>{formatStat(hitterAverages.볼넷, '볼넷')}</td>
                          <td>{formatStat(hitterAverages.사구, '사구')}</td>
                          <td>{formatStat(hitterAverages.삼진, '삼진')}</td>
                          <td>{formatStat(hitterAverages.타율, '타율')}</td>
                          <td>{formatStat(hitterAverages.출루, '출루')}</td>
                          <td>{formatStat(hitterAverages.장타, '장타')}</td>
                          <td>{formatStat(hitterAverages.OPS, 'OPS')}</td>
                          <td>{formatStat(hitterAverages.IsoP, 'IsoP')}</td>
                          <td>{formatStat(hitterAverages.BABIP, 'BABIP')}</td>
                          <td>{formatStat(hitterAverages.wOBA, 'wOBA')}</td>
                          <td>{formatStat(hitterAverages['wRC+'], 'wRC+')}</td>
                          <td>{formatStat(hitterAverages.WAR, 'WAR')}</td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <>
                      <tr>
                        <td style={{ fontWeight: 'bold', position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>선수 기록</td>
                        <td>{formatStat((selectedPlayer as Pitcher).경기, '경기')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).평균자책, '평균자책')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).승, '승')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).패, '패')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).세이브, '세이브')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).홀드, '홀드')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).이닝, '이닝')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).탈삼진, '탈삼진')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).피안타, '피안타')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).피홈런, '피홈런')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).실점, '실점')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).자책점, '자책점')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).볼넷, '볼넷')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).사구, '사구')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).QS, 'QS')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).WHIP, 'WHIP')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher)['K/9'], 'K/9')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher)['BB/9'], 'BB/9')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher)['K/BB'], 'K/BB')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher)['K%'], 'K%')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).WPA, 'WPA')}</td>
                        <td>{formatStat((selectedPlayer as Pitcher).WAR, 'WAR')}</td>
                      </tr>
                      {pitcherAverages && (
                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                          <td style={{ fontWeight: 'bold', position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 1 }}>리그 평균</td>
                          <td>{formatStat(pitcherAverages.경기, '경기')}</td>
                          <td>{formatStat(pitcherAverages.평균자책, '평균자책')}</td>
                          <td>{formatStat(pitcherAverages.승, '승')}</td>
                          <td>{formatStat(pitcherAverages.패, '패')}</td>
                          <td>{formatStat(pitcherAverages.세이브, '세이브')}</td>
                          <td>{formatStat(pitcherAverages.홀드, '홀드')}</td>
                          <td>{formatStat(pitcherAverages.이닝, '이닝')}</td>
                          <td>{formatStat(pitcherAverages.탈삼진, '탈삼진')}</td>
                          <td>{formatStat(pitcherAverages.피안타, '피안타')}</td>
                          <td>{formatStat(pitcherAverages.피홈런, '피홈런')}</td>
                          <td>{formatStat(pitcherAverages.실점, '실점')}</td>
                          <td>{formatStat(pitcherAverages.자책점, '자책점')}</td>
                          <td>{formatStat(pitcherAverages.볼넷, '볼넷')}</td>
                          <td>{formatStat(pitcherAverages.사구, '사구')}</td>
                          <td>{formatStat(pitcherAverages.QS, 'QS')}</td>
                          <td>{formatStat(pitcherAverages.WHIP, 'WHIP')}</td>
                          <td>{formatStat(pitcherAverages['K/9'], 'K/9')}</td>
                          <td>{formatStat(pitcherAverages['BB/9'], 'BB/9')}</td>
                          <td>{formatStat(pitcherAverages['K/BB'], 'K/BB')}</td>
                          <td>{formatStat(pitcherAverages['K%'], 'K%')}</td>
                          <td>{formatStat(pitcherAverages.WPA, 'WPA')}</td>
                          <td>{formatStat(pitcherAverages.WAR, 'WAR')}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
