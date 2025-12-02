// src/app/api/seasonal_pitcher_stats/route.ts
//db에서 시즌별 투수 스탯 가져오기
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const year = new Date().getFullYear();
  try {
    // Pool에서 커넥션을 빌려 쿼리 실행
    const result = await pool.query(
      `SELECT "ID", "이름", "선수이미지", "팀", "시즌", "경기", "평균자책", "승", "패", "세이브", "홀드", "이닝", "탈삼진", "피안타", "피홈런", "실점", "자책점", "볼넷", "사구", "QS", "WHIP", "K/9", "BB/9", "K/BB", "K%", "WPA", "WAR"
       FROM playerstats.seasonal_pitcher_stats
       WHERE "시즌" = $1`,
      [year]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
