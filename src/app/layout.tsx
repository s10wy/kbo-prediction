// src/app/layout.tsx
import "./globals.css";
import HomeBanner from "@/components/HomeBanner";

export const metadata = {
  title: "야구 정보 사이트 ⚾",
  description: "실시간 KBO 야구 정보 제공 웹사이트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-100 text-gray-900">
        <HomeBanner />
        <main className="pt-[64px]">{children}</main>
      </body>
    </html>
  );
}
