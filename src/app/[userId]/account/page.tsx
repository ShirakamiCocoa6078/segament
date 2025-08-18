'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AccountPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [gameProfiles, setGameProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      setName(session.user.name || '');
      // @ts-ignore
      setUsername(session.user.username || '');
      // Fetch game profiles or other necessary data
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/account/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username }),
    });

    if (res.ok) {
      await update({ name, username });
      toast({ title: '성공', description: '프로필이 업데이트되었습니다.' });
    } else {
      const data = await res.json();
      toast({ title: '오류', description: data.error || '프로필 업데이트에 실패했습니다.' });
    }
  };

  const checkUsername = async () => {
    if (!username) {
      return;
    }
    const res = await fetch(`/api/account/check-username?username=${username}`);
    const data = await res.json();
    setUsernameAvailable(data.isAvailable);
  };

  const handleDeleteGameProfile = async (profileId: string) => {
    const res = await fetch('/api/account/game-profile', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });

    if (res.ok) {
      toast({ title: '성공', description: '게임 프로필이 삭제되었습니다.' });
      // Refresh profiles
    } else {
      toast({ title: '오류', description: '게임 프로필 삭제에 실패했습니다.' });
    }
  };

  const handleDeleteAccount = async () => {
    const res = await fetch('/api/account/delete-account', {
      method: 'DELETE',
    });

    if (res.ok) {
      toast({ title: '성공', description: '계정이 삭제되었습니다.' });
      router.push('/'); // Redirect to home
    } else {
      toast({ title: '오류', description: '계정 삭제에 실패했습니다.' });
    }
  };

  if (!session) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">계정 설정</h1>

      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
          <CardDescription>표시될 이름과 고유 아이디를 설정하세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name">표시 닉네임</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="username">아이디</label>
              <div className="flex items-center space-x-2">
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <Button type="button" onClick={checkUsername}>중복 확인</Button>
              </div>
              {usernameAvailable === true && <p className="text-sm text-green-600">사용 가능한 아이디입니다.</p>}
              {usernameAvailable === false && <p className="text-sm text-red-600">이미 사용 중인 아이디입니다.</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={usernameAvailable === false}>저장</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>게임 프로필 관리</CardTitle>
          <CardDescription>연동된 게임 프로필을 삭제합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 게임별로 그룹화하여 프로필 표시 */}
          {['CHUNITHM', 'MAIMAI'].map((gameType) => {
            const profiles = gameProfiles.filter(p => p.gameType === gameType);
            return (
              <div key={gameType} className="mb-4">
                <div className="font-semibold text-lg mb-2">{gameType}</div>
                {profiles.length > 0 ? (
                  profiles.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between py-1">
                      <span>{profile.playerName} - {profile.region}</span>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteGameProfile(profile.id)}>삭제</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">프로필이 존재하지 않습니다</div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>계정 삭제</CardTitle>
          <CardDescription>이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.</CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">계정 삭제</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말로 계정을 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없으며, 모든 프로필과 플레이 데이터가 영구적으로 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
