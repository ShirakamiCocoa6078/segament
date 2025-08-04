import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  
  // 실험적 기능
  experimental: {
    // Vercel 서버에서 puppeteer-core와 @sparticuz/chromium을 
    // 외부 패키지로 인식하도록 설정하여 번들링 문제를 방지합니다.
    serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // 빌드 설정
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // 웹팩 최적화
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 빌드에서 번들 크기 최적화
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
