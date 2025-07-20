// 파일 경로: src/app/profile/create/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// toast 기능을 위해 useToast를 import 합니다.
import { useToast } from '@/hooks/use-toast'; 

export default function CreateProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName) {
      toast({
        title: '오류',
        description: '플레이어 이름은 필수입니다.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, title }),
      });

      if (response.ok) {
        toast({
          title: '성공',
          description: '프로필이 생성되었습니다! 대시보드로 이동합니다.',
        });
        // 프로필 생성 성공 후, 대시보드로 리디렉션
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로필 생성에 실패했습니다.');
      }
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

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Segament 프로필 생성</CardTitle>
            <CardDescription>
              CHUNITHM에서 사용할 프로필 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">플레이어 이름 (필수)</Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="게임 내에서 사용하는 이름"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">칭호 (선택)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게임 내에서 사용하는 칭호"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '생성 중...' : '프로필 생성하기'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
