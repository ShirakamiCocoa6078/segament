import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Vercel 서버에서 puppeteer-core와 @sparticuz/chromium을 
    // 외부 패키지로 인식하도록 설정하여 번들링 문제를 방지합니다.
    serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
