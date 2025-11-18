// src/app/api/games_by_date/route.ts
// 경기일정 API
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // date가 null일 수도 있으니 기본값 지정
    const date = url.searchParams.get("date") || "";
    if (!date) {
      return NextResponse.json({ error: "date 파라미터 누락" }, { status: 400 });
    }

    // 3일 전 ~ 3일 후 날짜 리스트
    const days: string[] = [];
    const base = new Date(date);

    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push(iso);
    }

    const where = days.map((_, i) => `$${i + 1}`).join(",");
    const sql = `
      SELECT "날짜", "구장", "홈팀", "홈점수", "원정팀", "원정점수", "승리팀"
      FROM "seasonalTeamStats_Matches"."kboallmatches"
      WHERE "날짜" IN (${where})
      ORDER BY "날짜" ASC
    `;
    const result = await pool.query(sql, days);
    return NextResponse.json({ days, games: result.rows });
  } catch (e) {
    return NextResponse.json({ error: "경기 데이터 오류" }, { status: 500 });
  }
}