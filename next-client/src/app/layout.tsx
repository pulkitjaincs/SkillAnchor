import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const metadata: Metadata = {
  title: "SkillAnchor - Find Local Jobs & Workers",
  description: "The modern hiring platform for skilled and hourly workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "var(--bg-body)" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
