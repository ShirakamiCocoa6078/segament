import { NextRequest } from 'next/server';
import { ImageResponse } from '@vercel/og';
import React from 'react';

// 최소 렌더링 테스트: 정상 동작 확인용
export async function GET(req: NextRequest) {
  try {
    const image = new ImageResponse(
      React.createElement('div', {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          background: '#fff',
          color: '#222',
        }
      }, 'OG 이미지 테스트'),
      {
        width: 1200,
        height: 1800,
      }
    );
    return image;
  } catch (err) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
