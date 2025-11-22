// src/app/predict/page.tsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Prediction = {
  gameId: string;
  날짜: string;
  구장: string;
  홈팀: string;
  홈점수: number;
  원정팀: string;
  원정점수: number;
  승리팀: string | null;
  예측승리팀: string;
  예측확률: number;
};

export default function PredictPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [appliedFilters, setAppliedFilters] = useState({
    selectedTeam: '',
    filterResult: 'all' as 'all' | 'correct' | 'incorrect',
    sortBy: 'date' as 'date' | 'probability',
    startDate: '',
    endDate: '',
    datePreset: 'all'
  });
  
  const [tempFilters, setTempFilters] = useState({
    selectedTeam: '',
    filterResult: 'all' as 'all' | 'correct' | 'incorrect',
    sortBy: 'date' as 'date' | 'probability',
    startDate: '',
    endDate: '',
    datePreset: 'all'
  });
  
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/predict');
        
        if (!response.ok) {
          throw new Error('예측 데이터를 불러올 수 없습니다.');
        }
        
        const data = await response.json();
        
        // ✅ 데이터 정제
        const cleanedPredictions: Prediction[] = data.predictions.map((p: any): Prediction => {
          const 승리팀Raw = String(p.승리팀 || '').trim();
          const 승리팀 = 승리팀Raw === '' || 승리팀Raw === 'null' || 승리팀Raw === 'undefined' ? null : 승리팀Raw;
          
          return {
            gameId: String(p.gameId),
            날짜: String(p.날짜),
            구장: String(p.구장),
            홈팀: String(p.홈팀).trim(),
            홈점수: Number(p.홈점수),
            원정팀: String(p.원정팀).trim(),
            원정점수: Number(p.원정점수),
            승리팀,
            예측승리팀: String(p.예측승리팀).trim(),
            예측확률: Number(p.예측확률)
          };
        });

        // ✅ 중복 제거: 타입 명시 수정
        const predictionMap = cleanedPredictions.reduce((map: Map<string, Prediction>, p: Prediction) => {
          const existing = map.get(p.gameId);
          if (!existing || p.예측확률 > existing.예측확률) {
            map.set(p.gameId, p);
          }
          return map;
        }, new Map<string, Prediction>());

        const uniquePredictions: Prediction[] = Array.from(predictionMap.values());
        
        console.log(`✅ 중복 제거: ${cleanedPredictions.length}개 → ${uniquePredictions.length}개`);
        
        setPredictions(uniquePredictions);
        
        // 초기 날짜 범위 설정
        if (uniquePredictions.length > 0) {
          const dates: string[] = uniquePredictions.map((p: Prediction): string => p.날짜).sort();
          const initialStartDate = dates[0];
          const initialEndDate = dates[dates.length - 1];
          
          setAppliedFilters(prev => ({
            ...prev,
            startDate: initialStartDate,
            endDate: initialEndDate
          }));
          
          setTempFilters(prev => ({
            ...prev,
            startDate: initialStartDate,
            endDate: initialEndDate
          }));
        }
        
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

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
  };

  const handleResetFilters = () => {
    if (predictions.length === 0) return;
    
    const dates = predictions.map(p => p.날짜).sort();
    const resetFilters = {
      selectedTeam: '',
      filterResult: 'all' as 'all' | 'correct' | 'incorrect',
      sortBy: 'date' as 'date' | 'probability',
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      datePreset: 'all'
    };
    
    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const handleDatePreset = (preset: string) => {
    if (predictions.length === 0) return;
    
    const allDates = predictions.map(p => p.날짜).sort();
    const latestDate = allDates[allDates.length - 1];
    const earliestDate = allDates[0];
    const latest = new Date(latestDate);
    
    let newStartDate = earliestDate;
    let newEndDate = latestDate;
    
    switch (preset) {
      case 'all':
        newStartDate = earliestDate;
        newEndDate = latestDate;
        break;
      case 'week':
        const weekAgo = new Date(latest);
        weekAgo.setDate(weekAgo.getDate() - 7);
        newStartDate = weekAgo.toISOString().split('T')[0];
        newEndDate = latestDate;
        break;
      case 'month':
        const monthAgo = new Date(latest);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        newStartDate = monthAgo.toISOString().split('T')[0];
        newEndDate = latestDate;
        break;
      case '3months':
        const threeMonthsAgo = new Date(latest);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        newStartDate = threeMonthsAgo.toISOString().split('T')[0];
        newEndDate = latestDate;
        break;
      case 'custom':
        return;
    }
    
    setTempFilters(prev => ({
      ...prev,
      datePreset: preset,
      startDate: newStartDate,
      endDate: newEndDate
    }));
  };

  const teams = ['전체', ...new Set(predictions.flatMap(p => [p.홈팀, p.원정팀]))];

  const filteredPredictions = useMemo(() => {
    return predictions.filter(p => {
      if (appliedFilters.startDate && p.날짜 < appliedFilters.startDate) return false;
      if (appliedFilters.endDate && p.날짜 > appliedFilters.endDate) return false;
      
      if (appliedFilters.selectedTeam && appliedFilters.selectedTeam !== '전체') {
        if (p.홈팀 !== appliedFilters.selectedTeam && p.원정팀 !== appliedFilters.selectedTeam) return false;
      }
      
      if (appliedFilters.filterResult === 'correct') {
        return p.승리팀 !== null && p.예측승리팀 === p.승리팀;
      } else if (appliedFilters.filterResult === 'incorrect') {
        return p.승리팀 !== null && p.예측승리팀 !== p.승리팀;
      }
      
      return true;
    }).sort((a, b) => {
      if (appliedFilters.sortBy === 'date') {
        return new Date(b.날짜).getTime() - new Date(a.날짜).getTime();
      }
      return b.예측확률 - a.예측확률;
    });
  }, [predictions, appliedFilters]);

  const hasFilterChanges = JSON.stringify(tempFilters) !== JSON.stringify(appliedFilters);

  const correctPredictions = filteredPredictions.filter(
    p => p.승리팀 !== null && p.예측승리팀 === p.승리팀
  ).length;
  
  const totalFinished = filteredPredictions.filter(p => p.승리팀 !== null).length;
  
  const accuracy = totalFinished > 0
    ? ((correctPredictions / totalFinished) * 100).toFixed(2)
    : '0.00';

  const avgProbability = filteredPredictions.length > 0
    ? (filteredPredictions.reduce((sum, p) => sum + p.예측확률, 0) / filteredPredictions.length * 100).toFixed(1)
    : '0.0';

  const highConfidenceCorrect = filteredPredictions.filter(
    p => p.예측확률 >= 0.6 && p.승리팀 !== null && p.예측승리팀 === p.승리팀
  ).length;

  const highConfidenceTotal = filteredPredictions.filter(
    p => p.예측확률 >= 0.6 && p.승리팀 !== null
  ).length;

  const highConfidenceAccuracy = highConfidenceTotal > 0
    ? ((highConfidenceCorrect / highConfidenceTotal) * 100).toFixed(1)
    : '0.0';

  const downloadCSV = () => {
    const csv = [
      ['날짜', '구장', '홈팀', '홈점수', '원정팀', '원정점수', '승리팀', '예측승리팀', '예측확률', '결과'],
      ...filteredPredictions.map(p => [
        p.날짜,
        p.구장,
        p.홈팀,
        p.홈점수,
        p.원정팀,
        p.원정점수,
        p.승리팀 || '진행중',
        p.예측승리팀,
        (p.예측확률 * 100).toFixed(1) + '%',
        p.승리팀 !== null
          ? (p.예측승리팀 === p.승리팀 ? '맞음' : '틀림')
          : '진행중'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `누적예측결과_${appliedFilters.startDate}_${appliedFilters.endDate}.csv`;
    link.click();
  };

  const getConfidenceLevel = (prob: number) => {
    if (prob >= 0.65) return { level: '매우 높음', color: '#10b981' };
    if (prob >= 0.6) return { level: '높음', color: '#60a5fa' };
    if (prob >= 0.55) return { level: '보통', color: '#f59e0b' };
    return { level: '낮음', color: '#ef4444' };
  };

  return (
    <main style={{ padding: '120px 2rem 2rem' }}>
      {/* 페이지 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.7rem', marginBottom: '0.5rem' }}>
            📊 누적 결과
          </h1>
          <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>
            AI 모델을 활용한 경기 결과 예측 누적 데이터
          </p>
        </div>
        
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
            🔮 예측 하러 가기
          </button>
        </Link>
      </div>

      {/* 기간 설정 섹션 */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">📅 기간 설정</h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {['all', 'week', 'month', '3months', 'custom'].map((preset) => (
            <button
              key={preset}
              onClick={() => handleDatePreset(preset)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: tempFilters.datePreset === preset ? 'var(--color-primary)' : 'var(--color-navbar-bg)',
                color: tempFilters.datePreset === preset ? '#fff' : 'var(--color-text)',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {preset === 'all' ? '전체' :
               preset === 'week' ? '최근 1주일' :
               preset === 'month' ? '최근 1개월' :
               preset === '3months' ? '최근 3개월' : '직접 선택'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '0.5rem' }}>
              시작일:
            </label>
            <input
              type="date"
              value={tempFilters.startDate}
              onChange={(e) => {
                setTempFilters(prev => ({
                  ...prev,
                  startDate: e.target.value,
                  datePreset: 'custom'
                }));
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-card-border)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            />
          </div>
          
          <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>~</div>
          
          <div>
            <label style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '0.5rem' }}>
              종료일:
            </label>
            <input
              type="date"
              value={tempFilters.endDate}
              onChange={(e) => {
                setTempFilters(prev => ({
                  ...prev,
                  endDate: e.target.value,
                  datePreset: 'custom'
                }));
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-card-border)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </section>
      
      {/* 통계 요약 */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">📊 예측 통계</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem',
          }}
        >
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              📅 선택된 기간
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {appliedFilters.startDate && appliedFilters.endDate 
                ? `${appliedFilters.startDate.slice(5)} ~ ${appliedFilters.endDate.slice(5)}` 
                : '-'}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
              {appliedFilters.datePreset === 'all' ? '전체 기간' : 
               appliedFilters.datePreset === 'week' ? '최근 1주일' :
               appliedFilters.datePreset === 'month' ? '최근 1개월' :
               appliedFilters.datePreset === '3months' ? '최근 3개월' : '직접 선택'}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              ⚾ 경기 수
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {filteredPredictions.length}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              ✅ 정확한 예측
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
              {correctPredictions} / {totalFinished}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              🎯 예측 정확도
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>
              {accuracy}%
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              📈 평균 신뢰도
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {avgProbability}%
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--color-navbar-bg)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              🔥 고신뢰도 정확도
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {highConfidenceAccuracy}%
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
              ({highConfidenceCorrect}/{highConfidenceTotal})
            </div>
          </div>
        </div>
      </section>

      {/* 필터 & 정렬 */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>🔍 필터 및 정렬</h2>
          
          {/* 보기 모드 전환 */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('card')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: viewMode === 'card' ? 'var(--color-primary)' : 'var(--color-navbar-bg)',
                color: viewMode === 'card' ? '#fff' : 'var(--color-text)',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              📇 카드
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-navbar-bg)',
                color: viewMode === 'table' ? '#fff' : 'var(--color-text)',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              📋 테이블
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {/* 팀 필터 */}
          <div>
            <label style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '0.5rem' }}>
              🏆 팀:
            </label>
            <select
              value={tempFilters.selectedTeam}
              onChange={(e) => setTempFilters(prev => ({ ...prev, selectedTeam: e.target.value }))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-card-border)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              {teams.map(team => (
                <option key={team} value={team === '전체' ? '' : team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* 결과 필터 */}
          <div>
            <label style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '0.5rem' }}>
              📊 결과:
            </label>
            <select
              value={tempFilters.filterResult}
              onChange={(e) => setTempFilters(prev => ({ ...prev, filterResult: e.target.value as 'all' | 'correct' | 'incorrect' }))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-card-border)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              <option value="all">전체</option>
              <option value="correct">맞음만</option>
              <option value="incorrect">틀림만</option>
            </select>
          </div>

          {/* 정렬 */}
          <div>
            <label style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '0.5rem' }}>
              📈 정렬:
            </label>
            <select
              value={tempFilters.sortBy}
              onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value as 'date' | 'probability' }))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-card-border)',
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              <option value="date">날짜 순</option>
              <option value="probability">확률 높은 순</option>
            </select>
          </div>
        </div>

        {/* 검색 버튼 영역 */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleApplyFilters}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: hasFilterChanges ? 'var(--color-primary)' : '#ccc',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: hasFilterChanges ? 'pointer' : 'not-allowed',
              border: 'none',
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
            disabled={!hasFilterChanges}
          >
            🔍 검색
            {hasFilterChanges && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '10px',
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
              }} />
            )}
          </button>

          <button
            onClick={handleResetFilters}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-navbar-bg)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '1px solid var(--color-card-border)',
              transition: 'all 0.3s ease',
            }}
          >
            🔄 초기화
          </button>

          {/* CSV 다운로드 */}
          <button
            onClick={downloadCSV}
            disabled={filteredPredictions.length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: filteredPredictions.length === 0 ? '#ccc' : '#10b981',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: filteredPredictions.length === 0 ? 'not-allowed' : 'pointer',
              border: 'none',
              transition: 'all 0.3s ease',
              marginLeft: 'auto',
            }}
          >
            📥 CSV 다운로드
          </button>
        </div>

        {/* 변경사항 안내 */}
        {hasFilterChanges && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>필터 설정이 변경되었습니다. "검색" 버튼을 눌러 적용하세요.</span>
          </div>
        )}
      </section>

      {/* 로딩 상태 */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="loading">예측 데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', borderColor: '#ef4444' }}>
          <p className="error" style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ {error}</p>
        </div>
      )}

      {/* 카드 뷰 */}
      {!loading && !error && viewMode === 'card' && (
        <section className="card">
          <h2 className="section-title">⚾ 경기 예측 결과</h2>
          
          {filteredPredictions.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginTop: '1.5rem',
              }}
            >
              {filteredPredictions.map((pred) => {
                const isFinished = pred.승리팀 !== null;
                const isCorrect = isFinished && pred.예측승리팀 === pred.승리팀;
                const confidence = getConfidenceLevel(pred.예측확률);
                
                return (
                  <div
                    key={pred.gameId}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: 'var(--color-card-bg)',
                      border: `2px solid ${isFinished ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--color-card-border)'}`,
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
                    {/* 날짜 및 구장 */}
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {pred.날짜}
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                          📍 {pred.구장}
                        </div>
                      </div>
                      {isFinished && (
                        <div
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: isCorrect ? '#10b981' : '#ef4444',
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {isCorrect ? '✅ 맞음' : '❌ 틀림'}
                        </div>
                      )}
                    </div>

                    {/* 팀 대결 */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                        padding: '1rem',
                        backgroundColor: 'var(--color-navbar-bg)',
                        borderRadius: '0.5rem',
                      }}
                    >
                      {/* 홈팀 */}
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ position: 'relative', width: '50px', height: '50px', margin: '0 auto 0.5rem' }}>
                          <Image
                            src={`/teams/${pred.홈팀}.png`}
                            alt={pred.홈팀}
                            fill
                            style={{
                              objectFit: 'contain',
                              borderRadius: '0.5rem',
                              opacity: isFinished && pred.승리팀 !== pred.홈팀 ? 0.5 : 1,
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/teams/default.png';
                            }}
                          />
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          color: pred.승리팀 === pred.홈팀 ? 'var(--color-primary)' : 'var(--color-text)'
                        }}>
                          {pred.홈팀}
                        </div>
                        {isFinished && (
                          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                            {pred.홈점수}
                          </div>
                        )}
                      </div>

                      {/* vs */}
                      <div style={{ fontSize: '0.85rem', opacity: 0.7, margin: '0 1rem', fontWeight: 'bold' }}>
                        vs
                      </div>

                      {/* 원정팀 */}
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ position: 'relative', width: '50px', height: '50px', margin: '0 auto 0.5rem' }}>
                          <Image
                            src={`/teams/${pred.원정팀}.png`}
                            alt={pred.원정팀}
                            fill
                            style={{
                              objectFit: 'contain',
                              borderRadius: '0.5rem',
                              opacity: isFinished && pred.승리팀 !== pred.원정팀 ? 0.5 : 1,
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/teams/default.png';
                            }}
                          />
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          color: pred.승리팀 === pred.원정팀 ? 'var(--color-primary)' : 'var(--color-text)'
                        }}>
                          {pred.원정팀}
                        </div>
                        {isFinished && (
                          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                            {pred.원정점수}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI 예측 */}
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f0f4ff',
                        borderRadius: '0.5rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                        🤖 AI 예측
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {pred.예측승리팀}
                          </div>
                          <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            확률: <span style={{ fontWeight: 'bold', color: confidence.color }}>
                              {(pred.예측확률 * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
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
                        height: '6px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '3px',
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
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
              <p style={{ fontSize: '1.1rem' }}>
                조건에 맞는 경기가 없습니다.
              </p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                필터 조건을 변경해보세요.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 테이블 뷰 */}
      {!loading && !error && viewMode === 'table' && (
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
                    const isFinished = pred.승리팀 !== null;
                    const isCorrect = isFinished && pred.예측승리팀 === pred.승리팀;
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
                            color: isFinished ? resultColor : 'var(--color-text)',
                            fontWeight: 'bold',
                          }}
                        >
                          {isCorrect ? '✅ 맞음' : (isFinished ? '❌ 틀림' : '⏳ 진행중')}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                      조건에 맞는 경기가 없습니다.
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
            <strong>모델:</strong> Stacking 앙상블 (Logistic + XGBoost + LightGBM + CatBoost)
          </li>
          <li>
            <strong>학습 데이터:</strong> 2009-2024년 KBO 경기 데이터
          </li>
          <li>
            <strong>예측 정확도:</strong> 약 {accuracy}% (선택된 기간 기준)
          </li>
          <li>
            <strong>고신뢰도 정확도:</strong> 약 {highConfidenceAccuracy}% (신뢰도 60% 이상)
          </li>
          <li>
            <strong>신뢰도:</strong> 0-100% (높을수록 신뢰도 높음)
          </li>
          <li>
            <strong>업데이트:</strong> 정기적으로 새 데이터 반영 (현재: 2025년 3-9월)
          </li>
        </ul>
      </section>
    </main>
  );
}
