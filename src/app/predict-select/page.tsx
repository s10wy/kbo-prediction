// src/app/predict-select/page.tsx
// 승부 예측 선택 페이지

'use client';
import React from 'react';
import Link from 'next/link';

export default function PredictSelectPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
      {/* 헤더 */}
      <section
        style={{
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          ⚾ 승부 예측
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
          원하는 예측 방식을 선택하세요
        </p>
      </section>

      {/* 메인 컨텐츠 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* 1. 실시간 경기 예측 (커스텀) */}
          <Link href="/predict-real-time" style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: '2.5rem',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid transparent',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* 아이콘 */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  fontSize: '2.5rem',
                }}
              >
                🔮
              </div>

              {/* 제목 */}
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1rem',
                }}
              >
                실시간 경기 예측
              </h2>

              {/* 설명 */}
              <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                팀과 선발 투수를 직접 선택하여 맞춤형 경기 결과를 예측합니다.
              </p>

              {/* 특징 */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>원하는 팀 선택</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>선발 투수 지정</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>즉시 예측 결과 확인</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>예측 히스토리 관리</span>
                </li>
              </ul>

              {/* 버튼 */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#667eea',
                  color: '#fff',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
              >
                시작하기 →
              </div>
            </div>
          </Link>

          {/* 2. 이전 경기 예측 (날짜별) */}
          <Link href="/predict" style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: '2.5rem',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid transparent',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* 아이콘 */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  fontSize: '2.5rem',
                }}
              >
                📅
              </div>

              {/* 제목 */}
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1rem',
                }}
              >
                날짜별 경기 예측
              </h2>

              {/* 설명 */}
              <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                특정 날짜의 모든 경기를 한 번에 예측하고 결과를 확인합니다.
              </p>

              {/* 특징 */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>날짜 선택</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>전체 경기 자동 예측</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>실제 선발 투수 기반</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>일괄 결과 확인</span>
                </li>
              </ul>

              {/* 버튼 */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
              >
                시작하기 →
              </div>
            </div>
          </Link>

          {/* 3. 누적 승부 예측 (시즌 전체) */}
          <Link href="/season" style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: '2.5rem',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid transparent',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* 아이콘 */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  fontSize: '2.5rem',
                }}
              >
                📊
              </div>

              {/* 제목 */}
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1rem',
                }}
              >
                시즌 누적 예측
              </h2>

              {/* 설명 */}
              <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                시즌 전체 경기의 예측 결과와 정확도를 분석합니다.
              </p>

              {/* 특징 */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>시즌 전체 데이터</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>예측 정확도 분석</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>팀별 통계</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#555', fontSize: '0.95rem' }}>순위 및 트렌드</span>
                </li>
              </ul>

              {/* 버튼 */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
              >
                시작하기 →
              </div>
            </div>
          </Link>
        </div>

        {/* 안내 메시지 */}
        <div
          style={{
            marginTop: '3rem',
            padding: '2rem',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
            💡 이용 안내
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#666', fontSize: '0.95rem' }}>
            <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ marginRight: '0.5rem', color: '#667eea', fontWeight: 'bold' }}>•</span>
              <span>
                <strong>실시간 경기 예측:</strong> 가상의 매치업을 만들어 다양한 시나리오를 테스트할 수 있습니다.
              </span>
            </li>
            <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ marginRight: '0.5rem', color: '#3b82f6', fontWeight: 'bold' }}>•</span>
              <span>
                <strong>날짜별 경기 예측:</strong> 특정 날짜의 실제 경기 일정과 선발 투수를 기반으로 예측합니다.
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ marginRight: '0.5rem', color: '#10b981', fontWeight: 'bold' }}>•</span>
              <span>
                <strong>시즌 누적 예측:</strong> 전체 시즌 데이터를 통해 모델의 성능과 팀별 트렌드를 분석합니다.
              </span>
            </li>
          </ul>
        </div>

        {/* 홈으로 돌아가기 */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/main" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4b5563';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6b7280';
              }}
            >
              ← 메인으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}