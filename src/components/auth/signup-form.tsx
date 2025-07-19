"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");

  const handleCancel = () => {
    router.push('/');
  };

  const handleCheckUsername = async () => {
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      const result = await response.json();
      console.log('중복 확인 결과:', result);
    } catch (error) {
      console.error('중복 확인 오류:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = {
      nickname,
      username,
      email: searchParams.get('email'),
      name: searchParams.get('name'),
      image: searchParams.get('image'),
      providerAccountId: searchParams.get('providerAccountId'),
      provider: searchParams.get('provider'),
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      console.log('회원가입 결과:', result);
    } catch (error) {
      console.error('회원가입 오류:', error);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">회원가입</CardTitle>
        <CardDescription>추가 정보를 입력해주세요.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              placeholder="사용할 닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">아이디</Label>
            <div className="flex gap-2">
              <Input
                id="username"
                placeholder="영문과 숫자로 구성된 아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Button type="button" variant="outline" onClick={handleCheckUsername}>
                중복 확인
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="button" variant="destructive" className="flex-1" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" className="flex-1">
            회원가입
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}