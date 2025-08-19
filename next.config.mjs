import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.oliveyoung.co.kr',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ururu-bucket.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'k.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'k.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ururu.shop',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/api/:path*',
        destination: isProd
          ? 'https://api.ururu.shop/api/:path*'
          : 'http://localhost:8080/api/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || 'your_kakao_client_id',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your_google_client_id',
    NEXT_PUBLIC_KAKAO_REDIRECT_URI_DEV:
      process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI_DEV || 'http://localhost:3000/auth/success',
    NEXT_PUBLIC_KAKAO_REDIRECT_URI_PROD:
      process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI_PROD || 'https://www.ururu.shop/auth/success',
    NEXT_PUBLIC_GOOGLE_REDIRECT_URI_DEV:
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI_DEV || 'http://localhost:3000/auth/success',
    NEXT_PUBLIC_GOOGLE_REDIRECT_URI_PROD:
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI_PROD || 'https://www.ururu.shop/auth/success',
    // API 기본 URL 추가
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NODE_ENV === 'production' ? 'https://api.ururu.shop' : 'http://localhost:8080',
  },
};

export default nextConfig;
