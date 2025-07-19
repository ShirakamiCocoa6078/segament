"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export function SignupForm() {
  const [nickname, setNickname] = useState("");
  const [userId, setUserId] = useState("");

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">회원가입</CardTitle>
        <CardDescription>추가 정보를 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            placeholder="사용할 닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userId">아이디</Label>
          <div className="flex gap-2">
            <Input
              id="userId"
              placeholder="영문과 숫자로 구성된 아이디"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Button type="button" variant="outline">
              중복 확인
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1">
          가입하기
        </Button>
        <Button variant="destructive" className="flex-1">
          취소
        </Button>
      </CardFooter>
    </Card>
  );
}