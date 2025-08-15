// 파일 경로: src/app/import/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ImportPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [progressMessage, setProgressMessage] = useState('데이터 요청 대기 중...');
  const [progressValue, setProgressValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage('REQUEST_SEGAMENT_DATA', '*');
    }

    const handleMessage = async (event: MessageEvent) => {
      if (!event.origin.includes('chunithm-net')) return;

      if (event.data?.type === 'SEGAMENT_PROGRESS') {
        setProgressMessage(event.data.payload.message);
        setProgressValue(event.data.payload.value);
      }

      if (event.data?.type === 'SEGAMENT_ERROR') {
        setErrorMessage(event.data.payload.message);
      }

      if (event.data?.type === 'SEGAMENT_DATA_PAYLOAD') {
        try {
          setProgressMessage('서버에 데이터 저장 중... (이 과정은 몇 분 정도 소요될 수 있습니다)');
          let dbProgress = 0;
          const interval = setInterval(() => {
            dbProgress += 5;
            if (dbProgress <= 95) {
              setProgressValue(dbProgress);
            }
          }, 500);

          const response = await fetch('/api/v1/import/chunithm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event.data.payload),
          });

          clearInterval(interval);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '서버 업로드에 실패했습니다.');
          }

          setProgressMessage('모든 데이터 저장 완료! 대시보드로 이동합니다.');
          setProgressValue(100);

          setTimeout(() => {
            if (session?.user?.id) {
              window.location.href = `/${session.user.id}/dashboard`;
            } else {
              setErrorMessage('세션 정보를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.');
            }
          }, 1500);

        } catch (error: any) {
          setErrorMessage(error.message);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [session]);
  
  if (sessionStatus === 'loading') return <div>세션 정보를 불러오는 중...</div>;
  if (sessionStatus === 'unauthenticated') return <div>Segament에 먼저 로그인해주세요.</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-center">Segament 데이터 가져오는 중...</h2>
        <div className="mt-6 space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressValue}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
            <p className="text-sm text-gray-600 text-center">{progressMessage}</p>
        </div>
        {errorMessage && <p className="mt-4 text-sm text-red-600 text-center">{errorMessage}</p>}
      </div>
    </div>
  );
}