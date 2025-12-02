import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query(
            `SELECT DISTINCT "시즌" FROM "seasonalTeamStats_Matches"."kbogamesteamsstats" ORDER BY "시즌" DESC`
        );

        const seasons = result.rows.map(row => row.시즌);
        return NextResponse.json(seasons);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load seasons" }, { status: 500 });
    }
}
