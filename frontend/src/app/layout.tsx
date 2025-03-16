import type { Metadata } from "next";
import "./globals.css";
import { ConfigProvider } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: "Silvia Fang Take Home",
  description: "Silvia Fang Rigetti Take Home",
};

const theme = {
  token: {
    colorPrimary: "#5a7ea3",
    colorInfo: "#5a7ea3",
    colorSuccess: "#49d685",
    colorWarning: "#f39c12",
    colorError: "#e74c3c",
    colorLink: "#3498db",
    colorTextBase: "#333333",
    borderRadius: 6,
    fontFamily: "var(--font-inter)",
  },
  components: {
    Table: {
      colorFillAlter: '#EBF5FB',
      colorFillSecondary: '#EBF5FB',
      headerBg: '#BBDDF3',
    },
    Card: {
      fontFamily: "var(--font-dm-sans)",
      borderRadius: 6,
      colorBorderSecondary: '#D2D2D2',
      colorTextHeading: '#1F2B37',
    },
    Select: {
      fontFamily: "var(--font-inter)",
      colorBorder: '#8AA4BE',
      hoverBorderColor: '#4A6785',
      controlHeight: 40,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <body
        className={'font-dm-sans antialiased'}
      >
        <ConfigProvider theme={theme}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
