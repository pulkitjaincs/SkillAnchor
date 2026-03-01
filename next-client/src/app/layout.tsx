import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Providers from "@/providers/Providers";
import Navbar from "@/components/layout/Navbar";

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
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
