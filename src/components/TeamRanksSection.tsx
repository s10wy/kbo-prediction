// src/components/TeamRanksSection.tsx
"use client";
import React, { useEffect, useState } from "react";

type TeamRank = {
  rank: number;
  team: string;
  played: number;
  win: number;
  lose: number;
  draw: number;
  win_rate: string;
};

export default function TeamRanksSection() {
  const [ranks, setRanks] = useState<TeamRank[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/team_ranks")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRanks(data.slice(0, 10)); // ✅ 표시 갯수 설정(배너용)
          setError(null);
        } else {
          setRanks([]);
          setError("팀 순위 데이터를 불러오지 못했습니다.");
        }
      })
      .catch(() => {
        setRanks([]);
        setError("팀 순위 데이터를 불러오지 못했습니다.");
      });
  }, []);

  return (
    <div className="team-rank-banner">

      {error ? (
        <p className="team-rank-error">{error}</p>
      ) : ranks.length === 0 ? (
        <p className="team-rank-loading">데이터 불러오는 중...</p>
      ) : (
        <table className="team-rank-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>팀명</th>
              <th>승</th>
              <th>패</th>
              <th>무</th>
              <th>승률</th>
            </tr>
          </thead>
          <tbody>
            {ranks.map((t) => (
              <tr key={t.rank}>
                <td>{t.rank}</td>
                <td>{t.team}</td>
                <td>{t.win}</td>
                <td>{t.lose}</td>
                <td>{t.draw}</td>
                <td>{t.win_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
