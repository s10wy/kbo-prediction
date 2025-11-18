// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // 주요 컬럼만 조회 (필요시 전체 조회 가능)
  const result = await client.query(`
    SELECT 
      "ID","선수명","등번호","생년월일","포지션","신장/체중","경력",
      "입단 계약금","연봉","지명순위","입단년도"
    FROM playerinfo.hitter_info
    LIMIT 50
  `)

  //테스트용 
  //const result = await client.query('SELECT * FROM playerinfo.hitter_info LIMIT 1000;');
  
  await client.end();

  return NextResponse.json(result.rows);
}
