import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silvia Fang Take Home",
  description: "Silvia Fang Rigetti Take Home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={'font-dm-sans antialiased'}
      >
        {children}
      </body>
    </html>
  );
}
