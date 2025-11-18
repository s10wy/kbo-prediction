// src/components/TopPlayersSection.tsx
"use client";
import React, { useEffect, useState } from "react";

type TopPlayer = {
  type: string;
  선수명: string;
  소속팀: string;
  record: number | string;
  image?: string;
};

export default function TopPlayersSection() {
  const [players, setPlayers] = useState<TopPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/top_players")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayers(data);
          setError(null);
        } else {
          setPlayers([]);
          setError("선수 기록 데이터를 불러오지 못했습니다.");
        }
      })
      .catch(() => {
        setPlayers([]);
        setError("선수 기록 데이터를 불러오지 못했습니다.");
      });
  }, []);

  return (
    <div className="top-players-mini-banner">
      {error ? (
        <p className="mini-banner-error">{error}</p>
      ) : players.length === 0 ? (
        <p className="mini-banner-loading">데이터 불러오는 중...</p>
      ) : (
        <table className="mini-banner-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>선수</th>
              <th>기록</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, index) => (
              <tr key={index}>
                <td>{p.type}</td>
                <td className="mini-player">
                  <img
                    src={p.image || "/players/no_image.png"}
                    alt={p.선수명}
                    className="mini-avatar"
                    onError={(e) => {
                      // 이미지 로딩 실패 시 기본 이미지로 대체
                      const target = e.currentTarget;
                      if (target.src !== "/players/no_image.png") {
                        target.src = "/players/no_image.png";
                      }
                    }}
                  />
                  {p.선수명}
                </td>
                <td className="record">{p.record}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
