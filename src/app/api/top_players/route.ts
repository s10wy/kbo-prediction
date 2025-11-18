// src/app/api/top_players/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import axios from "axios";

async function ensurePlayerImage(fileName: string, imageUrl: string) {
  const localPath = path.join(process.cwd(), "public", "players", fileName);
  try {
    await fs.access(localPath);
    return; // 파일이 이미 존재함
  } catch {
    try {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      await fs.writeFile(localPath, response.data);
      console.log(`이미지 저장 완료: ${fileName}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`이미지 다운로드 실패: ${fileName}`, error.message);
      } else {
        console.error(`이미지 다운로드 실패: ${fileName}`, "알 수 없는 에러");
      }
    }
  }
}

export async function GET() {
  try {
    const hitterYearQ = `SELECT MAX("시즌") AS year FROM "playerstats"."seasonal_hitter_stats"`;
    const pitcherYearQ = `SELECT MAX("시즌") AS year FROM "playerstats"."seasonal_pitcher_stats"`;
    const hitterYearRes = await pool.query(hitterYearQ);
    const pitcherYearRes = await pool.query(pitcherYearQ);
    const hitterYear = hitterYearRes.rows[0].year;
    const pitcherYear = pitcherYearRes.rows[0].year;

    const queries = [
      {
        label: "타율왕",
        sql: `SELECT "ID" AS id, "이름" AS name, "팀" AS team, "타율" AS record, "선수이미지" AS image
              FROM "playerstats"."seasonal_hitter_stats"
              WHERE "시즌" = $1
              ORDER BY "타율" DESC NULLS LAST LIMIT 1`,
        params: [hitterYear]
      },
      {
        label: "타점왕",
        sql: `SELECT "ID" AS id, "이름" AS name, "팀" AS team, "타점" AS record, "선수이미지" AS image
              FROM "playerstats"."seasonal_hitter_stats"
              WHERE "시즌" = $1
              ORDER BY "타점" DESC NULLS LAST LIMIT 1`,
        params: [hitterYear]
      },
      {
        label: "홈런왕",
        sql: `SELECT "ID" AS id, "이름" AS name, "팀" AS team, "홈런" AS record, "선수이미지" AS image
              FROM "playerstats"."seasonal_hitter_stats"
              WHERE "시즌" = $1
              ORDER BY "홈런" DESC NULLS LAST LIMIT 1`,
        params: [hitterYear]
      },
      {
        label: "승리왕",
        sql: `SELECT "ID" AS id, "이름" AS name, "팀" AS team, "승" AS record, "선수이미지" AS image
              FROM "playerstats"."seasonal_pitcher_stats"
              WHERE "시즌" = $1
              ORDER BY "승" DESC NULLS LAST LIMIT 1`,
        params: [pitcherYear]
      }
    ];

    const topPlayers = [];

    for (const q of queries) {
      const res = await pool.query(q.sql, q.params);
      if (res.rows.length > 0) {
        const player = res.rows[0];
        const fileName = `${player.id}.png`;
        await ensurePlayerImage(fileName, player.image);
        topPlayers.push({
          type: q.label,
          선수명: player.name,
          소속팀: player.team,
          record: player.record,
          image: `/players/${fileName}`,
        });
      }
    }

    return NextResponse.json(topPlayers);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("TOP PLAYERS API 오류:", error.message);
    } else {
      console.error("TOP PLAYERS API 오류: 알 수 없는 에러");
    }
    return NextResponse.json({ error: "Failed to load top players" }, { status: 500 });
  }
}
