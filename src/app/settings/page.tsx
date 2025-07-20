// 파일 경로: src/app/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // 페이지 로드 시, 현재 사용자의 API 키를 가져옵니다.
  useEffect(() => {
    fetch('/api/user/api-key')
      .then((res) => res.json())
      .then((data) => {
        if (data.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch API key:', err);
        toast({
          title: '오류',
          description: 'API 키를 불러오는 데 실패했습니다.',
          variant: 'destructive',
        });
      })
      .finally(() => setIsLoading(false));
  }, [toast]);

  // 'API 키 생성/재발급' 버튼 클릭 시 실행될 함수
  const handleGenerateApiKey = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/api-key', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API 키 생성에 실패했습니다.');
      }
      setApiKey(data.apiKey);
      toast({
        title: '성공',
        description: '새로운 API 키가 발급되었습니다.',
      });
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // '복사하기' 버튼 클릭 시 실행될 함수
  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast({
        title: '성공',
        description: 'API 키가 클립보드에 복사되었습니다.',
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>설정</CardTitle>
          <CardDescription>
            API 키 및 기타 설정을 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">개인 액세스 토큰 (API 키)</h3>
            <p className="text-sm text-muted-foreground">
              북마크릿이 데이터를 안전하게 전송하기 위해 사용하는 고유한 키입니다.
              외부에 노출되지 않도록 주의해주세요.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <Input
                readOnly
                value={isLoading ? '로딩 중...' : apiKey || '아직 API 키가 없습니다.'}
                placeholder="API Key"
              />
              <Button onClick={handleCopyApiKey} disabled={!apiKey || isLoading}>
                복사
              </Button>
            </div>
          </div>
          <div>
            <Button onClick={handleGenerateApiKey} disabled={isLoading}>
              {isLoading ? '처리 중...' : (apiKey ? 'API 키 재발급' : 'API 키 생성')}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              키를 재발급하면 기존 키는 더 이상 사용할 수 없게 됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}