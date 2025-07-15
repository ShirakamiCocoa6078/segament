"use client";

import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  const { data: session, update } = useSession();

  // 실제로는 DB를 조회해서 'Account' 테이블에 해당 유저의 provider='google' 레코드가 있는지 확인해야 합니다.
  // 여기서는 임시로 false로 설정합니다.
  const isGoogleLinked = false; 

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">계정 관리</h2>
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-semibold">닉네임:</span> {session?.user?.nickname || '설정 안됨'}</p>
            <p><span className="font-semibold">이메일:</span> {session?.user?.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>계정 연동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-2">
                    {/* <ChromeIcon className="h-5 w-5" /> */}
                    <span className="font-semibold">Google</span>
                </div>
                {isGoogleLinked ? (
                  <Button variant="outline" disabled>연동됨</Button>
                ) : (
                  <Button onClick={() => signIn('google')}>연동하기</Button>
                )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
} 