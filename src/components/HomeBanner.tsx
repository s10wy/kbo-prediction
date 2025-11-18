// src/components/HomeBanner.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeBanner() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const menuItems = [
    { name: "홈", href: "/" },
    { name: "시즌정보", href: "/season" },
    { name: "선수정보", href: "/players" },
    { name: "티켓 예매", href: "/tickets" },
    { name: "승부 예측", href: "/predict-real-time" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* 좌측 로고 */}
        <Link href="/" className="navbar-logo">
          ⚾ 야구정보 알려드립니다
        </Link>

        {/* 중앙 메뉴 */}
        <ul className="navbar-menu">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`navbar-link ${
                  pathname === item.href ? "active" : ""
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* ✅ 오른쪽 끝 버튼 */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "다크모드" : "라이트모드"}
        </button>
      </div>
    </header>
  );
}
