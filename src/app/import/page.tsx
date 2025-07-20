// 파일 경로: src/app/import/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// 진행 상태를 시각적으로 보여주는 컴포넌트
const StatusIndicator = ({ status, label }: { status: string; label: string }) => {
  let color = 'text-gray-500';
  if (status === 'processing') color = 'text-blue-500 animate-pulse';
  if (status === 'complete') color = 'text-green-500';
  if (status === 'error') color = 'text-red-500';
  return <div className={`flex items-center p-2 ${color}`}>●<span className="ml-2">{label}</span></div>;
};

export default function ImportPage() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState({
    receiving: 'processing', // 'processing', 'complete', 'error'
    uploading: 'pending',
    finalizing: 'pending',
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 1. 원본 창(CHUNITHM-NET)에 데이터 요청 메시지를 보냅니다.
    if (window.opener) {
      // CHUNITHM-NET의 두 가지 가능한 도메인 모두에게 요청을 보냅니다.
      window.opener.postMessage('REQUEST_SEGAMENT_DATA', 'https://new.chunithm-net.com');
      window.opener.postMessage('REQUEST_SEGAMENT_DATA', 'https://chunithm-net-eng.com');
    }

    // 2. 원본 창으로부터 데이터를 수신 대기합니다.
    const handleMessage = async (event: MessageEvent) => {
      // 보안: 신뢰할 수 있는 출처의 메시지만 처리합니다.
      if (!['https://new.chunithm-net.com', 'https://chunithm-net-eng.com'].includes(event.origin)) {
        return;
      }

      if (event.data && event.data.type === 'SEGAMENT_DATA_PAYLOAD') {
        setProgress(prev => ({ ...prev, receiving: 'complete', uploading: 'processing' }));
        
        try {
          // 3. 수신한 데이터를 백엔드 API로 전송합니다.
          const response = await fetch('/api/v1/import/chunithm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event.data.payload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '서버 업로드에 실패했습니다.');
          }

          setProgress(prev => ({ ...prev, uploading: 'complete', finalizing: 'processing' }));
          
          // 4. 성공 처리 및 대시보드로 리디렉션
          setTimeout(() => {
            setProgress(prev => ({ ...prev, finalizing: 'complete' }));
            // 부모 창(원본 탭)이 아닌, 현재 탭을 대시보드로 이동시킵니다.
            window.location.href = '/dashboard';
          }, 1500);

        } catch (error: any) {
          setProgress(prev => ({ ...prev, uploading: 'error' }));
          setErrorMessage(error.message);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [router]);
  
  // 인증 상태에 따른 UI 처리
  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">세션 정보를 불러오는 중...</div>;
  }
  
  if (sessionStatus === 'unauthenticated') {
    return <div className="flex items-center justify-center min-h-screen">Segament에 먼저 로그인해주세요. 이 창을 닫고 다시 시도해주세요.</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-center">Segament 데이터 가져오는 중...</h2>
        <p className="text-sm text-gray-600 text-center mt-2">이 창을 닫지 마세요. 작업이 완료되면 자동으로 이동합니다.</p>
        <div className="mt-6">
          <StatusIndicator status={progress.receiving} label="CHUNITHM-NET에서 데이터 수신" />
          <StatusIndicator status={progress.uploading} label="Segament 서버로 데이터 업로드" />
          <StatusIndicator status={progress.finalizing} label="마무리 작업" />
        </div>
        {errorMessage && <p className="mt-4 text-sm text-red-600 text-center">{errorMessage}</p>}
      </div>
    </div>
  );
}