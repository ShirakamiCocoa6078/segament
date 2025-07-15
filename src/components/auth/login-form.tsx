"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ChromeIcon } from 'lucide-react'; // Google 아이콘을 위해 추가

// 기존 폼 관련 코드는 유지하거나, Google 로그인만 사용할 경우 일부를 제거할 수 있습니다.
// 여기서는 기존 폼을 유지하고 Google 로그인 버튼을 추가하는 예시를 보여줍니다.

export function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">다시 오신 것을 환영합니다</CardTitle>
        <CardDescription>사이트를 이용하려면 로그인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 기존 이메일/비밀번호 폼 */}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        {/* 기존 로그인 버튼 */}
        <div className="relative flex items-center justify-center">
          <Separator className="absolute w-full" />
          <span className="relative bg-card px-2 text-xs text-muted-foreground">또는</span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ChromeIcon className="mr-2 h-4 w-4" /> // Google 아이콘
          )}
          Google로 로그인
        </Button>
      </CardFooter>
    </Card>
  );
}
