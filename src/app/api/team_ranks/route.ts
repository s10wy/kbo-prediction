// src/app/api/team_ranks/route.ts
// 팀순위 가져오기
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
        `SELECT "랭킹" AS rank, "팀이름" AS team, "경기수" AS played, "승리" AS win, "패배" AS lose, "무승부" AS draw, "승률" AS win_rate, "팀타율" AS batting_rate, "팀평균자책" AS pitching_rate
        FROM "seasonalTeamStats_Matches"."kbogamesteamsstats"
        WHERE "시즌" = (SELECT MAX("시즌") FROM "seasonalTeamStats_Matches"."kbogamesteamsstats")
        ORDER BY "랭킹" ASC`
    );

    return NextResponse.json(result.rows);
  } catch (e) {
    //console.error(e);
    return NextResponse.json({ error: "Failed to load team ranks" }, { status: 500 });
  }
}
