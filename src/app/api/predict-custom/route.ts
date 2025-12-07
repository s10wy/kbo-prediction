// src/app/api/predict-custom/route.ts
// 커스텀 경기 예측 API 프록시

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kbo-prediction-95nq.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[API] Custom prediction request:', body);
    
    // 유효성 검사
    if (!body.homeTeam || !body.awayTeam || !body.homePitcher || !body.awayPitcher) {
      return NextResponse.json(
        { error: '모든 필드가 필요합니다.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/predict-custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[API] Backend error: ${response.status}`, errorData);
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API] Prediction successful:', data.predictions?.[0]?.예측승리팀);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error in custom prediction:', error);
    return NextResponse.json(
      { error: 'Failed to process prediction request' },
      { status: 500 }
    );
  }
}