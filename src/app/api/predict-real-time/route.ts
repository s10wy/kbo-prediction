// src/app/api/predict-real-time/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { error: '날짜 파라미터가 필요합니다. (YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { error: '올바른 날짜 형식이 필요합니다. (YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  try {
    // ⭐ Python 서버 호출
    const pythonServer = process.env.NEXT_PUBLIC_PYTHON_SERVER;
    
    if (!pythonServer) {
      throw new Error('Python 서버 URL이 설정되지 않았습니다.');
    }

    console.log(`[Calling Python Server] ${pythonServer}/predict?date=${date}`);

    const response = await fetch(`${pythonServer}/predict?date=${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Python 서버 오류' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      predictions: data.predictions || [],
    });

  } catch (error) {
    console.error('[Python Server Error]', error);
    return NextResponse.json(
      { 
        error: '실시간 예측 서버에 연결할 수 없습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
