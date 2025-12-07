// src/app/api/teams-and-pitchers/route.ts
// 팀과 투수 목록 조회 API 프록시

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kbo-prediction-95nq.onrender.com';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Fetching teams and pitchers from backend...');
    
    const response = await fetch(`${BACKEND_URL}/api/teams-and-pitchers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 항상 최신 데이터 가져오기
    });

    if (!response.ok) {
      console.error(`[API] Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Successfully fetched ${data.teams?.length || 0} teams and ${data.pitchers?.length || 0} pitchers`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error fetching teams and pitchers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams and pitchers from backend' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}