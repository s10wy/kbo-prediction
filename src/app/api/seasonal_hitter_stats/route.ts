// src/app/api/seasonal_hitter_stats/route.ts
//db에서 시즌별 타자 스탯 가져오기
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  const year = new Date().getFullYear();

  // Pool에서 커넥션을 빌려 쿼리 실행
  try {
    const result = await pool.query(
      `SELECT "ID", "이름", "선수이미지", "키", "몸무게", "등번호", "포지션", "팀", "시즌", "경기", "타석", "안타", "홈런", "타점"
       FROM playerstats.seasonal_hitter_stats
       WHERE "시즌" = $1`,
      [year]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
