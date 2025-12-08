import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        // Try fetching hitter stats first
        const hitterResult = await pool.query(
            `SELECT "ID", "이름", "선수이미지", "키", "몸무게", "등번호", "포지션", "팀", "시즌", "경기", "타석", "안타", "홈런", "타점", "득점", "2타", "3타", "도루", "볼넷", "사구", "삼진", "타율", "출루", "장타", "OPS", "IsoP", "BABIP", "wOBA", "wRC+", "WAR"
       FROM playerstats.seasonal_hitter_stats
       WHERE "ID" = $1
       ORDER BY "시즌" DESC`,
            [id]
        );

        if (hitterResult.rows.length > 0) {
            return NextResponse.json(hitterResult.rows);
        }

        // If no hitter stats, try pitcher stats
        const pitcherResult = await pool.query(
            `SELECT "ID", "이름", "선수이미지", "키", "몸무게", "팀", "시즌", "경기", "평균자책", "승", "패", "세이브", "홀드", "이닝", "탈삼진", "피안타", "피홈런", "실점", "자책점", "볼넷", "사구", "QS", "WHIP", "K/9", "BB/9", "K/BB", "K%", "WPA", "WAR"
       FROM playerstats.seasonal_pitcher_stats
       WHERE "ID" = $1
       ORDER BY "시즌" DESC`,
            [id]
        );

        return NextResponse.json(pitcherResult.rows);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
