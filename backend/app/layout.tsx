
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CrewConnect Backend",
  description: "CrewConnect API server status",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
