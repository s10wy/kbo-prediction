// src/app/api/predict/route.ts (최간단 버전)
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type PredictionData = {
  gameId: string;
  날짜: string;
  구장: string;
  홈팀: string;
  홈점수: number;
  원정팀: string;
  원정점수: number;
  승리팀: string;
  예측승리팀: string;
  예측확률: number;
};

// CSV 파싱 함수 (내장)
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    return record;
  });
}

export async function GET(req: Request) {
  try {
    const csvPath = path.join(
      process.cwd(),
      'public/data/prediction_2025_MarNov.csv'
    );

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { error: '예측 데이터 파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parseCSV(fileContent);

    const predictions: PredictionData[] = records.map((record) => ({
      gameId: record.gameId,
      날짜: record.날짜,
      구장: record.구장,
      홈팀: record.홈팀,
      홈점수: parseInt(record.홈점수) || 0,
      원정팀: record.원정팀,
      원정점수: parseInt(record.원정점수) || 0,
      승리팀: record.승리팀,
      예측승리팀: record.예측승리팀,
      예측확률: parseFloat(record.예측확률) || 0,
    }));

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('예측 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '예측 데이터를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
