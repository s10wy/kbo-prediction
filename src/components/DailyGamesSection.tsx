// src/components/DailyGamesSection.tsx
// 경기 일정 컴포넌트
"use client";
import React, { useEffect, useState } from "react";

// 경기 정보 타입 명시
type Game = {
  구장: string;
  홈팀: string;
  홈점수: number | string;
  원정팀: string;
  원정점수: number | string;
  날짜?: string;
};

const teams: { code: string; name: string; logo: string }[] = [
  { code: '두산', name: '두산 베어스', logo: '/teams/두산.png' },
  { code: '삼성', name: '삼성 라이온즈', logo: '/teams/삼성.png' },
  { code: 'KIA', name: 'KIA 타이거즈', logo: '/teams/KIA.png' },
  { code: '롯데', name: '롯데 자이언츠', logo: '/teams/롯데.png' },
  { code: 'NC', name: 'NC 다이노스', logo: '/teams/NC.png' },
  { code: '한화', name: '한화 이글스', logo: '/teams/한화.png' },
  { code: 'LG', name: 'LG 트윈스', logo: '/teams/LG.png' },
  { code: 'SSG', name: 'SSG 랜더스', logo: '/teams/SSG.png' },
  { code: 'KT', name: 'KT 위즈', logo: '/teams/KT.png' },
  { code: '키움', name: '키움 히어로즈', logo: '/teams/키움.png' }
];

function getTeamLogo(teamCode: string): string {
  const found = teams.find((t) => t.code === teamCode);
  return found ? found.logo : "/teams/default.png";
}

// 날짜 YYYY-MM-DD 변환
function pad(num: number): string { return String(num).padStart(2, "0"); }
function toISO(date: string | Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function GameCard({ match }: { match: Game }) {
  return (
    <div style={{
      boxShadow: "0 0 6px #ddd",
      borderRadius: "12px",
      margin: "18px 0",
      padding: "20px 27px",
      background: "#fff",
      width: "350px"
    }}>
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.14rem", marginBottom: "7px" }}>
        {match.구장}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ textAlign: "center", minWidth: "95px" }}>
          <img src={getTeamLogo(match.홈팀)} alt={match.홈팀} style={{ width: 40, height: 40, marginBottom: 5 }} />
          <div style={{ fontSize: "1rem" }}>{match.홈팀}</div>
        </div>
        <div style={{ fontSize: "1.23rem", fontWeight: "bold" }}>
          {match.홈점수} : {match.원정점수}
        </div>
        <div style={{ textAlign: "center", minWidth: "95px" }}>
          <img src={getTeamLogo(match.원정팀)} alt={match.원정팀} style={{ width: 40, height: 40, marginBottom: 5 }} />
          <div style={{ fontSize: "1rem" }}>{match.원정팀}</div>
        </div>
      </div>
    </div>
  );
}

export default function DailyGamesSection({ initialDate }: { initialDate?: string }) {
  // 오늘 날짜 구하기 (YYYY-MM-DD)
  const today = toISO(new Date());
  const [targetDate, setTargetDate] = useState<string>(initialDate || today);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 날짜 이동 함수
  function moveDate(offset: number) {
    const d = new Date(targetDate);
    d.setDate(d.getDate() + offset);
    setTargetDate(toISO(d));
  }

  useEffect(() => {
    fetch(`/api/games_by_date?date=${targetDate}`)
      .then(res => res.json())
      .then((data) => {
        setGames(data.games.filter((g: Game) => g.날짜 === targetDate));
        setError(null);
      })
      .catch(() => setError("경기 데이터를 불러올 수 없습니다."));
  }, [targetDate]);

  return (
    <div>
      <h3 style={{ textAlign: "center", fontSize: "1.2rem", margin: "1rem 0" }}>오늘의 경기</h3>
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: "18px", margin: "18px 0"
      }}>
        <button onClick={() => moveDate(-1)} style={{ padding: "5px 18px" }}>← 이전</button>
        <span style={{ fontWeight: "bold", fontSize: "1.13rem" }}>{targetDate}</span>
        <button onClick={() => moveDate(1)} style={{ padding: "5px 18px" }}>다음 →</button>
      </div>
      {error ? (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", justifyContent: "center" }}>
          {games.length === 0
            ? <div>해당 날짜 경기가 없습니다.</div>
            : games.map((match, i) => (
              <GameCard key={i} match={match} />
            ))
          }
        </div>
      )}
    </div>
  );
}

