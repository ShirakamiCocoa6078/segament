"use client";

// 모든 외부 라이브러리 import를 제거하고, 기본 UI 컴포넌트만 남깁니다.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function SignupForm() {

  // 가장 기본적인 form의 submit 이벤트 핸들러입니다.
  const handleBareSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // 1. 기본 form 제출 동작(페이지 새로고침)을 막습니다.
    event.preventDefault();

    // 2. 이 로그가 Vercel 로그에 찍히는지 확인하는 것이 핵심입니다.
    console.log("디버깅용 기본 폼 제출 성공!");
    
    // 3. 브라우저에서 이 경고창이 뜨는지 확인합니다.
    alert("디버깅용 기본 폼 제출 성공!");
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">회원가입 디버깅</CardTitle>
        <CardDescription>가장 기본적인 폼 제출 테스트입니다.</CardDescription>
      </CardHeader>
      
      {/* react-hook-form의 <Form> 컴포넌트 없이 순수 <form> 태그만 사용합니다. */}
      <form onSubmit={handleBareSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-input">테스트 입력</Label>
            <Input id="test-input" name="test" placeholder="아무거나 입력" />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            기본 제출 테스트
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}