'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import PlayerStatsChart from '@/components/PlayerStatsChart'
import { Hitter, Pitcher } from '@/types/player'

export default function PlayerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params.id)

    const [hitters, setHitters] = useState<Hitter[]>([])
    const [pitchers, setPitchers] = useState<Pitcher[]>([])
    const [loading, setLoading] = useState(true)
    const [isRegulationFilterEnabled, setIsRegulationFilterEnabled] = useState<boolean>(false)
    const [seasonalStats, setSeasonalStats] = useState<(Hitter | Pitcher)[]>([])

    const [selectedSeasons, setSelectedSeasons] = useState<Set<string>>(new Set())

    useEffect(() => {
        Promise.all([
            fetch('/api/seasonal_hitter_stats').then(res => res.json()),
            fetch('/api/seasonal_pitcher_stats').then(res => res.json()),
            fetch(`/api/players/${id}/stats`).then(res => res.json())
        ]).then(([hittersData, pitchersData, seasonalData]) => {
            setHitters(Array.isArray(hittersData) ? hittersData : [])
            setPitchers(Array.isArray(pitchersData) ? pitchersData : [])
            const stats = Array.isArray(seasonalData) ? seasonalData : []
            setSeasonalStats(stats)

            // Default select the most recent season
            if (stats.length > 0) {
                setSelectedSeasons(new Set([stats[0].시즌]))
            }

            setLoading(false)
        })
    }, [id])

    const selectedPlayer = React.useMemo(() => {
        if (loading) return null
        // First try to find in seasonalStats as it has more detailed info now
        if (seasonalStats.length > 0) {
            return seasonalStats[0]
        }
        const hitter = hitters.find(h => h.ID === id)
        if (hitter) return hitter
        const pitcher = pitchers.find(p => p.ID === id)
        return pitcher || null
    }, [hitters, pitchers, seasonalStats, id, loading])

    // Helper to check if player is Hitter
    const isHitter = (player: Hitter | Pitcher): player is Hitter => {
        return (player as Hitter).타석 !== undefined
    }

    const toggleSeason = (season: string) => {
        const newSelected = new Set(selectedSeasons)
        if (newSelected.has(season)) {
            newSelected.delete(season)
        } else {
            newSelected.add(season)
        }
        setSelectedSeasons(newSelected)
    }

    const getTeamLogoPath = (teamName: string) => {
        const teamMap: { [key: string]: string } = {
            'KIA': 'KIA.png',
            'KT': 'KT.png',
            'LG': 'LG.png',
            'NC': 'NC.png',
            'SSG': 'SSG.png',
            '두산': '두산.png',
            '롯데': '롯데.png',
            '삼성': '삼성.png',
            '키움': '키움.png',
            '한화': '한화.png'
        }
        return `/teams/${teamMap[teamName] || 'KIA.png'}` // Fallback to KIA or a default image if needed
    }

    // Convert decimal innings to fractional format (e.g., 154.667 -> "154 2/3")
    const convertInningsToFractional = (innings: number): string => {
        const wholeInnings = Math.floor(innings)
        const decimal = innings - wholeInnings

        // Determine outs (0, 1, or 2)
        let outs = 0
        if (decimal >= 0.166 && decimal < 0.5) {
            outs = 1
        } else if (decimal >= 0.5) {
            outs = 2
        }

        if (outs === 0) {
            return String(wholeInnings)
        } else if (outs === 1) {
            return `${wholeInnings} 1/3`
        } else {
            return `${wholeInnings} 2/3`
        }
    }

    const formatStat = (value: number | string | undefined | null, key?: string) => {
        if (value === undefined || value === null) return '-'

        // Special handling for innings (이닝) which is stored as string like "154 2/3"
        if (key === '이닝') {
            // If it's already a string, return as-is
            if (typeof value === 'string') {
                return value
            }
            // If it's a number (from league average), convert to fractional format
            if (typeof value === 'number') {
                return convertInningsToFractional(value)
            }
        }

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

        let targetHitters = hitters;
        if (isRegulationFilterEnabled) {
            targetHitters = hitters.filter(h => h.타석 >= 446);
        }

        const keys = ['경기', '타석', '안타', '홈런', '타점', '득점', '2타', '3타', '도루', '볼넷', '사구', '삼진', '타율', '출루', '장타', 'OPS', 'IsoP', 'BABIP', 'wOBA', 'wRC+', 'WAR']
        const avgs: any = {}
        keys.forEach(key => {
            avgs[key] = calculateAverage(targetHitters, key)
        })
        return avgs
    }, [hitters, isRegulationFilterEnabled])

    const pitcherAverages = React.useMemo(() => {
        if (pitchers.length === 0) return null

        let targetPitchers = pitchers;
        if (isRegulationFilterEnabled) {
            targetPitchers = pitchers.filter(p => p.이닝 >= 144);
        }

        const keys = ['경기', '평균자책', '승', '패', '세이브', '홀드', '이닝', '탈삼진', '피안타', '피홈런', '실점', '자책점', '볼넷', '사구', 'QS', 'WHIP', 'K/9', 'BB/9', 'K/BB', 'K%', 'WPA', 'WAR']
        const avgs: any = {}
        keys.forEach(key => {
            avgs[key] = calculateAverage(targetPitchers, key)
        })
        return avgs
    }, [pitchers, isRegulationFilterEnabled])

    // Filter stats for the chart based on selected seasons
    const chartPlayers = React.useMemo(() => {
        return seasonalStats.filter(stat => selectedSeasons.has(stat.시즌))
    }, [seasonalStats, selectedSeasons])

    if (loading) {
        return <div style={{ padding: '120px 2rem', textAlign: 'center' }}>Loading...</div>
    }

    if (!selectedPlayer) {
        return (
            <div style={{ padding: '120px 2rem', textAlign: 'center' }}>
                <p>선수를 찾을 수 없습니다.</p>
                <button onClick={() => router.push('/players')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    목록으로 돌아가기
                </button>
            </div>
        )
    }

    return (
        <main style={{ padding: '120px 2rem 2rem' }}>
            <section className="player-detail">
                <button
                    onClick={() => router.push('/players')}
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
                            <div style={{ marginTop: '0.5rem', fontSize: '1rem', opacity: 0.7 }}>
                                <p>키/몸무게: {selectedPlayer.키 ? `${selectedPlayer.키}cm` : '-'} / {selectedPlayer.몸무게 ? `${selectedPlayer.몸무게}kg` : '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* 차트 섹션 */}
                    <PlayerStatsChart
                        players={chartPlayers.length > 0 ? chartPlayers : [selectedPlayer]}
                        averages={isHitter(selectedPlayer) ? hitterAverages : pitcherAverages}
                        isHitter={isHitter(selectedPlayer)}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 className="section-title" style={{ marginBottom: 0 }}>시즌 기록 비교</h3>
                        <button
                            onClick={() => setIsRegulationFilterEnabled(!isRegulationFilterEnabled)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: isRegulationFilterEnabled ? '1px solid var(--color-primary)' : '1px solid #ccc',
                                backgroundColor: isRegulationFilterEnabled ? 'var(--color-primary)' : '#fff',
                                color: isRegulationFilterEnabled ? '#fff' : '#666',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isRegulationFilterEnabled ? '✅ 규정타석/이닝 적용 중' : '⚪ 전체 선수 평균'}
                        </button>
                    </div>
                    <div className="table-scroll">
                        <table>
                            <thead>
                                {isHitter(selectedPlayer) ? (
                                    <tr>
                                        <th style={{ minWidth: '50px', position: 'sticky', left: 0, zIndex: 2 }}>비교</th>
                                        <th style={{ minWidth: '80px', position: 'sticky', left: 50, zIndex: 1 }}>구분</th>
                                        <th>팀</th>
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
                                        <th style={{ minWidth: '50px', position: 'sticky', left: 0, zIndex: 2 }}>비교</th>
                                        <th style={{ minWidth: '80px', position: 'sticky', left: 50, zIndex: 1 }}>구분</th>
                                        <th>팀</th>
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
                                        {hitterAverages && (
                                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                                <td style={{ position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 2 }}>-</td>
                                                <td style={{ fontWeight: 'bold', position: 'sticky', left: 50, background: 'var(--color-bg-secondary)', zIndex: 1 }}>현재리그평균</td>
                                                <td>-</td>
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
                                        {seasonalStats.map((stat) => (
                                            <tr key={stat.시즌}>
                                                <td style={{ position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 2, textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSeasons.has(stat.시즌)}
                                                        onChange={() => toggleSeason(stat.시즌)}
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                </td>
                                                <td style={{ fontWeight: 'bold', position: 'sticky', left: 50, background: 'var(--color-bg-secondary)', zIndex: 1 }}>{stat.시즌}</td>
                                                <td>
                                                    <div style={{ position: 'relative', width: '30px', height: '30px', margin: '0 auto' }}>
                                                        <Image
                                                            src={getTeamLogoPath(stat.팀)}
                                                            alt={stat.팀}
                                                            fill
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                </td>
                                                <td>{formatStat(stat.경기, '경기')}</td>
                                                <td>{formatStat((stat as Hitter).타석, '타석')}</td>
                                                <td>{formatStat((stat as Hitter).안타, '안타')}</td>
                                                <td>{formatStat((stat as Hitter).홈런, '홈런')}</td>
                                                <td>{formatStat((stat as Hitter).타점, '타점')}</td>
                                                <td>{formatStat((stat as Hitter).득점, '득점')}</td>
                                                <td>{formatStat((stat as Hitter)['2타'], '2타')}</td>
                                                <td>{formatStat((stat as Hitter)['3타'], '3타')}</td>
                                                <td>{formatStat((stat as Hitter).도루, '도루')}</td>
                                                <td>{formatStat((stat as Hitter).볼넷, '볼넷')}</td>
                                                <td>{formatStat((stat as Hitter).사구, '사구')}</td>
                                                <td>{formatStat((stat as Hitter).삼진, '삼진')}</td>
                                                <td>{formatStat((stat as Hitter).타율, '타율')}</td>
                                                <td>{formatStat((stat as Hitter).출루, '출루')}</td>
                                                <td>{formatStat((stat as Hitter).장타, '장타')}</td>
                                                <td>{formatStat((stat as Hitter).OPS, 'OPS')}</td>
                                                <td>{formatStat((stat as Hitter).IsoP, 'IsoP')}</td>
                                                <td>{formatStat((stat as Hitter).BABIP, 'BABIP')}</td>
                                                <td>{formatStat((stat as Hitter).wOBA, 'wOBA')}</td>
                                                <td>{formatStat((stat as Hitter)['wRC+'], 'wRC+')}</td>
                                                <td>{formatStat((stat as Hitter).WAR, 'WAR')}</td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {pitcherAverages && (
                                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                                <td style={{ position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 2 }}>-</td>
                                                <td style={{ fontWeight: 'bold', position: 'sticky', left: 50, background: 'var(--color-bg-secondary)', zIndex: 1 }}>현재리그평균</td>
                                                <td>-</td>
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
                                        {seasonalStats.map((stat) => (
                                            <tr key={stat.시즌}>
                                                <td style={{ position: 'sticky', left: 0, background: 'var(--color-bg-secondary)', zIndex: 2, textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSeasons.has(stat.시즌)}
                                                        onChange={() => toggleSeason(stat.시즌)}
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                </td>
                                                <td style={{ fontWeight: 'bold', position: 'sticky', left: 50, background: 'var(--color-bg-secondary)', zIndex: 1 }}>{stat.시즌}</td>
                                                <td>
                                                    <div style={{ position: 'relative', width: '30px', height: '30px', margin: '0 auto' }}>
                                                        <Image
                                                            src={getTeamLogoPath(stat.팀)}
                                                            alt={stat.팀}
                                                            fill
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                </td>
                                                <td>{formatStat((stat as Pitcher).경기, '경기')}</td>
                                                <td>{formatStat((stat as Pitcher).평균자책, '평균자책')}</td>
                                                <td>{formatStat((stat as Pitcher).승, '승')}</td>
                                                <td>{formatStat((stat as Pitcher).패, '패')}</td>
                                                <td>{formatStat((stat as Pitcher).세이브, '세이브')}</td>
                                                <td>{formatStat((stat as Pitcher).홀드, '홀드')}</td>
                                                <td>{formatStat((stat as Pitcher).이닝, '이닝')}</td>
                                                <td>{formatStat((stat as Pitcher).탈삼진, '탈삼진')}</td>
                                                <td>{formatStat((stat as Pitcher).피안타, '피안타')}</td>
                                                <td>{formatStat((stat as Pitcher).피홈런, '피홈런')}</td>
                                                <td>{formatStat((stat as Pitcher).실점, '실점')}</td>
                                                <td>{formatStat((stat as Pitcher).자책점, '자책점')}</td>
                                                <td>{formatStat((stat as Pitcher).볼넷, '볼넷')}</td>
                                                <td>{formatStat((stat as Pitcher).사구, '사구')}</td>
                                                <td>{formatStat((stat as Pitcher).QS, 'QS')}</td>
                                                <td>{formatStat((stat as Pitcher).WHIP, 'WHIP')}</td>
                                                <td>{formatStat((stat as Pitcher)['K/9'], 'K/9')}</td>
                                                <td>{formatStat((stat as Pitcher)['BB/9'], 'BB/9')}</td>
                                                <td>{formatStat((stat as Pitcher)['K/BB'], 'K/BB')}</td>
                                                <td>{formatStat((stat as Pitcher)['K%'], 'K%')}</td>
                                                <td>{formatStat((stat as Pitcher).WPA, 'WPA')}</td>
                                                <td>{formatStat((stat as Pitcher).WAR, 'WAR')}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    )
}
