"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // 입력 상태
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  
  // UI 상태
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<'available' | 'taken' | 'unchecked'>('unchecked');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    toast({
      title: "회원가입이 취소되었습니다.",
      description: "홈페이지로 이동합니다.",
    });
    router.push('/');
  };

  const handleCheckUsername = async () => {
    const isValidUsername = /^[a-zA-Z0-9]{1,15}$/.test(username);
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "아이디를 입력해주세요.",
      });
      return;
    }
    if (!isValidUsername) {
      toast({
        variant: "destructive",
        title: "아이디 형식 오류",
        description: "영문과 숫자만 사용, 15자 이내로 입력해주세요.",
      });
      return;
    }
    setIsCheckingUsername(true);
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const result = await response.json();
      setUsernameAvailability(result.isAvailable ? 'available' : 'taken');
    } catch (error) {
      console.error('중복 확인 오류:', error);
      toast({
        variant: "destructive",
        title: "중복 확인 실패",
        description: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const isValidUsername = /^[a-zA-Z0-9]{1,15}$/.test(username);
    if (!nickname.trim() || !username.trim()) {
      toast({
        variant: "destructive",
        title: "입력 정보 부족",
        description: "닉네임과 아이디를 입력해주세요.",
      });
      return;
    }
    if (!isValidUsername) {
      toast({
        variant: "destructive",
        title: "아이디 형식 오류",
        description: "영문과 숫자만 사용, 15자 이내로 입력해주세요.",
      });
      return;
    }
    if (usernameAvailability !== 'available') {
      toast({
        variant: "destructive",
        title: "아이디 확인 필요",
        description: "아이디 중복 확인을 통과해야 합니다.",
      });
      return;
    }
    
    const userData = {
      nickname,
      username,
      email: searchParams.get('email'),
      name: searchParams.get('name'),
      image: searchParams.get('image'),
      providerAccountId: searchParams.get('providerAccountId'),
      provider: searchParams.get('provider'),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.status === 201) {
        toast({
          title: "회원가입 완료!",
          description: "회원가입이 완료되었습니다! 다시 로그인하여 서비스를 이용해주세요.",
        });
        router.push('/');
      } else if (response.status === 409) {
        toast({
          variant: "destructive",
          title: "가입 실패",
          description: "이미 사용 중인 아이디 또는 이메일입니다.",
        });
      } else {
        throw new Error(result.message || '가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      toast({
        variant: "destructive",
        title: "가입 실패",
        description: "가입에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // username이 변경될 때 중복 확인 상태 초기화
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameAvailability('unchecked');
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
                onChange={handleUsernameChange}
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCheckUsername}
                disabled={isCheckingUsername || !username.trim()}
              >
                {isCheckingUsername ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "중복 확인"
                )}
              </Button>
            </div>
            {/* 중복 확인 결과 메시지 */}
            {usernameAvailability === 'available' && (
              <p className="text-sm text-green-600">
                ✓ 사용 가능한 아이디입니다.
              </p>
            )}
            {usernameAvailability === 'taken' && (
              <p className="text-sm text-red-600">
                ✗ 이미 사용 중인 아이디입니다.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            type="button" 
            variant="destructive" 
            className="flex-1" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting || usernameAvailability !== 'available'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                가입 중...
              </>
            ) : (
              "회원가입"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}