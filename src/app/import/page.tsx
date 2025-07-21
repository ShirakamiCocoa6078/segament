// 파일 경로: src/app/import/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    receiving: 'processing',
    uploading: 'pending',
    finalizing: 'pending',
  });
  const [progressMessage, setProgressMessage] = useState('데이터 요청 대기 중...');
  const [progressValue, setProgressValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage('REQUEST_SEGAMENT_DATA', 'https://new.chunithm-net.com');
      window.opener.postMessage('REQUEST_SEGAMENT_DATA', 'https://chunithm-net-eng.com');
    }

    const handleMessage = async (event: MessageEvent) => {
      if (!['https://new.chunithm-net.com', 'https://chunithm-net-eng.com'].includes(event.origin)) return;

      if (event.data?.type === 'SEGAMENT_PROGRESS') {
        setProgressMessage(event.data.payload.message);
        setProgressValue(event.data.payload.value);
      }

      if (event.data?.type === 'SEGAMENT_ERROR') {
        setProgress(prev => ({ ...prev, receiving: 'error' }));
        setErrorMessage(event.data.payload.message);
      }
      
      if (event.data?.type === 'SEGAMENT_DATA_PAYLOAD') {
        setProgress(prev => ({ ...prev, receiving: 'complete', uploading: 'processing' }));
        setProgressMessage('서버로 데이터 업로드 중...');
        
        try {
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
          setProgressMessage('마무리 작업 중...');
          
          setTimeout(() => {
            setProgress(prev => ({ ...prev, finalizing: 'complete' }));
            window.location.href = '/dashboard';
          }, 1500);

        } catch (error: any) {
          setProgress(prev => ({ ...prev, uploading: 'error' }));
          setErrorMessage(error.message);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);
  
  if (sessionStatus === 'loading') return <div className="flex items-center justify-center min-h-screen">세션 정보를 불러오는 중...</div>;
  if (sessionStatus === 'unauthenticated') return <div className="flex items-center justify-center min-h-screen">Segament에 먼저 로그인해주세요.</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-center">Segament 데이터 가져오는 중...</h2>
        <div className="mt-6 space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressValue}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
            <p className="text-sm text-gray-600 text-center">{progressMessage}</p>
        </div>
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