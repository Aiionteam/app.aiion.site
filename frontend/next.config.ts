import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* eslint-disable-line */
  
  // Lambda 최적화: 압축 및 성능 최적화
  compress: true, // gzip 압축 활성화
  
  // JSON 응답 최적화
  experimental: {
    // 서버 컴포넌트 최적화
    optimizePackageImports: ['@/lib'],
  },
  
  // 헤더 최적화
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
