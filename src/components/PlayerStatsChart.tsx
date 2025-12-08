'use client'
import React, { useEffect, useState } from 'react'
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
import { Hitter, Pitcher } from '@/types/player'

// Chart.js 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

// 비율 스탯 정의
const RATE_STATS = [
    '타율', '출루', '장타', 'OPS', 'IsoP', 'BABIP', 'wOBA', 'WAR',
    '평균자책', 'WHIP', 'K/9', 'BB/9', 'K/BB', 'K%', 'WPA'
];

export default function PlayerStatsChart({ players, averages, isHitter }: { players: (Hitter | Pitcher)[], averages: any, isHitter: boolean }) {
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
    }, [isHitter]);


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

    // 색상 팔레트
    const colors = [
        'rgba(53, 162, 235, 0.7)', // Blue
        'rgba(75, 192, 192, 0.7)', // Teal
        'rgba(255, 206, 86, 0.7)', // Yellow
        'rgba(153, 102, 255, 0.7)', // Purple
        'rgba(255, 159, 64, 0.7)', // Orange
        'rgba(199, 199, 199, 0.7)', // Grey
    ];

    const borderColors = [
        'rgba(53, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
    ];

    // 데이터셋 생성 헬퍼
    const createChartData = (stats: string[], labelSuffix: string) => {
        const datasets = players.map((player, index) => {
            const playerValues = stats.map(key => {
                const val = (player as any)[key];
                return val !== undefined ? Number(val) : 0;
            });
            return {
                label: `${player.시즌} ${player.이름}`,
                data: playerValues,
                backgroundColor: colors[index % colors.length],
                borderColor: borderColors[index % borderColors.length],
                borderWidth: 1,
            };
        });

        // 리그 평균 데이터셋 추가 (항상 마지막에)
        const avgValues = stats.map(key => {
            const val = averages[key];
            return val !== undefined ? Number(val) : 0;
        });

        datasets.push({
            label: '리그 평균',
            data: avgValues,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
        });

        return {
            labels: stats,
            datasets: datasets
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
                상세 기록 분석
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
                    차트 설정
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
