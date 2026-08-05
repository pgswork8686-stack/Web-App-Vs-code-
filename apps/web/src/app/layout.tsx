import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PGS Hub - Nền Tảng Quản Trị Đại Lý",
  description: "Hệ thống quản lý dự án, chấm công và công việc PGS Agency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
