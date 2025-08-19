import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '모각코어 - 함께하는 코딩 시간',
  description: '커뮤니티 멤버들과 함께하는 모각코 참여 현황을 실시간으로 확인하세요',
  keywords: ['모각코', '코딩', '스터디', '개발', '프로그래밍'],
  authors: [{ name: '모각코어 팀' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: '모각코어 - 함께하는 코딩 시간',
    description: '커뮤니티 멤버들과 함께하는 모각코 참여 현황을 실시간으로 확인하세요',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '모각코어 - 함께하는 코딩 시간',
    description: '커뮤니티 멤버들과 함께하는 모각코 참여 현황을 실시간으로 확인하세요',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}