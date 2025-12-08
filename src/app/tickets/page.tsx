// src/app/tickets/page.tsx
"use client";

const teams = [
  {
    id: "lg",
    name: "LG 트윈스",
    stadium: "잠실야구장",
    url: "https://www.ticketlink.co.kr/sports/137/59",
  },
  {
    id: "doosan",
    name: "두산 베어스",
    stadium: "잠실야구장",
    url: "https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07001&TeamCode=PB004",
  },
  {
    id: "lotte",
    name: "롯데 자이언츠",
    stadium: "사직야구장",
    url: "https://ticket.giantsclub.com/loginForm.do",
  },
  {
    id: "samsung",
    name: "삼성 라이온즈",
    stadium: "대구라이온즈파크",
    url: "https://www.ticketlink.co.kr/sports/137/57",
  },
  {
    id: "ssg",
    name: "SSG 랜더스",
    stadium: "인천SSG랜더스필드",
    url: "https://www.ticketlink.co.kr/sports/137/476",
  },
  {
    id: "kia",
    name: "KIA 타이거즈",
    stadium: "광주챔피언스필드",
    url: "https://www.ticketlink.co.kr/sports/137/58",
  },
  {
    id: "hanwha",
    name: "한화 이글스",
    stadium: "대전이글스파크",
    url: "https://www.ticketlink.co.kr/sports/137/63",
  },
  {
    id: "nc",
    name: "NC 다이노스",
    stadium: "창원NC파크",
    url: "https://ticket.ncdinos.com/login",
  },
  {
    id: "kiwoom",
    name: "키움 히어로즈",
    stadium: "고척스카이돔",
    url: "https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07001&TeamCode=PB003",
  },
  {
    id: "kt",
    name: "케이티 위즈",
    stadium: "수원케이티위즈파크",
    url: "https://www.ticketlink.co.kr/sports/137/62",
  },
];

export default function TicketsPage() {
  return (
    <main style={{ paddingTop: "120px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 className="section-title">🎟️ 구단별 공식 티켓 예매</h1>
      <p style={{ marginBottom: "1.2rem", color: "var(--color-text)" }}>
        각 구단의 공식 예매 사이트로 이동합니다.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.2rem",
        }}
      >
        {teams.map((team) => (
          <a
            key={team.id}
            href={team.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card"
            style={{
              textAlign: "center",
              padding: "1rem",
              cursor: "pointer",
              transition: "transform 0.3s ease",
            }}
          >
            <h3 style={{ color: "var(--color-primary)" }}>{team.name}</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text)" }}>
               {team.stadium}
            </p>
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.85rem",
                color: "gray",
              }}
            >
              🔗 공식 예매 바로가기
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
