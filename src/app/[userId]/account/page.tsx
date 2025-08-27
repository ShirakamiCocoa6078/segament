'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

export default function AccountPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [gameProfiles, setGameProfiles] = useState<any[]>([]);
  const [profilePublicStates, setProfilePublicStates] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session) {
      setName(session.user.name || '');
      // @ts-ignore
      setUsername(session.user.username || '');
      // 실제 게임 프로필 fetch
      if (session.user.id) {
        fetch('/api/dashboard')
          .then(res => res.json())
          .then(data => {
            setGameProfiles(data.profiles || []);
            // 프로필별 공개여부 상태 초기화 (기본값: 공개)
            const states: Record<string, boolean> = {};
            (data.profiles || []).forEach((p: any) => {
              states[p.id] = typeof p.isPublic === 'boolean' ? p.isPublic : true;
            });
            setProfilePublicStates(states);
          });
      }
    }
  }, [session]);

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
      // 즉시 사이드바 프로필 목록 갱신
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profileUpdated'));
      }
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
      // next-auth의 signOut을 호출하여 세션 완전 종료
      if (typeof window !== 'undefined') {
        const signOut = (await import('next-auth/react')).signOut;
        signOut({ callbackUrl: '/' });
      } else {
        router.push('/');
      }
    } else {
      toast({ title: '오류', description: '계정 삭제에 실패했습니다.' });
    }
  };

  if (!session) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
  <div className="container mx-auto p-2 sm:p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">게임 프로필</CardTitle>
        </CardHeader>
        <CardContent>
          {gameProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* 게임별로 그룹화하여 프로필 표시 */}
              {['CHUNITHM', 'MAIMAI'].map((gameType) => {
                const profiles = gameProfiles.filter(p => p.gameType === gameType);
                return (
                  <div key={gameType} className="mb-4">
                    <div className="font-semibold text-lg mb-2">{gameType}</div>
                    {profiles.length > 0 ? (
                      profiles.map(profile => (
                        <div key={profile.id} className="flex items-center justify-between py-1 gap-2">
                          <span>{profile.playerName} - {profile.region}</span>
                          {/* segament 스타일 Select 컴포넌트 적용 */}
                          <div className="w-28">
                            <Select
                              value={profilePublicStates[profile.id] ? 'public' : 'private'}
                              onValueChange={v => setProfilePublicStates(prev => ({ ...prev, [profile.id]: v === 'public' }))}
                            >
                              <SelectTrigger className="w-full h-9 text-sm" />
                              <SelectContent>
                                <SelectItem value="public">공개</SelectItem>
                                <SelectItem value="private">비공개</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">삭제</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>정말로 이 프로필을 삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 작업은 되돌릴 수 없으며, 해당 게임의 모든 플레이 데이터가 영구적으로 삭제됩니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteGameProfile(profile.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm sm:text-base text-muted-foreground">프로필이 존재하지 않습니다</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm sm:text-base text-muted-foreground">프로필이 존재하지 않습니다</div>
          )}
        </CardContent>
      </Card>
      <Card className="border-destructive">
      {/* 저장/취소 버튼을 계정 삭제 박스 아래에 배치, 순서: 취소-저장 */}
      <div className="flex justify-end gap-2 mt-8">
        <Button
          variant="outline"
          onClick={() => {
            // 원래 상태로 복구
            const states: Record<string, boolean> = {};
            gameProfiles.forEach((p: any) => {
              states[p.id] = typeof p.isPublic === 'boolean' ? p.isPublic : true;
            });
            setProfilePublicStates(states);
            toast({ title: '취소', description: '변경사항이 취소되었습니다.' });
          }}
        >취소</Button>
        <Button
          variant="default"
          disabled={isSaving}
          onClick={async () => {
            setIsSaving(true);
            // 공개여부 저장 API 호출
            const res = await fetch('/api/account/update-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicStates: profilePublicStates }),
            });
            setIsSaving(false);
            if (res.ok) {
              toast({ title: '성공', description: '프로필 공개여부가 저장되었습니다.' });
            } else {
              toast({ title: '오류', description: '프로필 공개여부 저장에 실패했습니다.' });
            }
          }}
        >저장</Button>
      </div>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">계정 삭제</CardTitle>
          <CardDescription className="text-base sm:text-lg">이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.</CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto py-3 sm:py-2 text-base sm:text-lg">계정 삭제</Button>
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
