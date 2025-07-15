"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { completeSignUp } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

// 폼 유효성 검사를 위한 Zod 스키마
const formSchema = z.object({
  nickname: z.string().min(2, { message: "닉네임은 2자 이상이어야 합니다." }),
  username: z.string().min(4, { message: "아이디는 4자 이상이어야 합니다." }),
  password: z.string().min(6, { message: "비밀번호는 6자 이상이어야 합니다." }),
  email: z.string().email(),
  name: z.string(),
  image: z.string().url().optional(),
});

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'unavailable'>('idle');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // 실시간 유효성 검사
    defaultValues: {
      email: searchParams.get("email") || "",
      name: searchParams.get("name") || "",
      image: searchParams.get("image") || "",
      nickname: "",
      username: "",
      password: "",
    },
  });

  // isSubmitting 상태는 react-hook-form이 내부적으로 관리합니다.
  const { isSubmitting } = form.formState;

  const handleCheckUsername = async () => {
    // Zod를 통해 username 필드만 먼저 유효성 검사
    const isUsernameValid = await form.trigger("username");
    if (!isUsernameValid) return;

    setIsCheckingUsername(true);
    const username = form.getValues("username");
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setUsernameStatus(data.isAvailable ? 'available' : 'unavailable');
    } catch (error) {
      toast({ variant: "destructive", title: "오류", description: "아이디 확인 중 오류가 발생했습니다." });
      setUsernameStatus('idle');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // react-hook-form의 유효성 검사를 통과했을 때만 실행될 최종 제출 함수
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // 제출 직전, 아이디 중복 확인이 완료되었는지 마지막으로 체크
    if (usernameStatus !== 'available') {
      toast({ variant: "destructive", title: "확인 필요", description: "아이디 중복 확인을 먼저 진행해주세요." });
      return;
    }

    try {
      const result = await completeSignUp(values);
      if (result.error) throw new Error(result.error);

      toast({ title: "회원가입 성공", description: "잠시 후 자동으로 로그인됩니다." });
      // Google 계정으로 다시 로그인하여 세션을 생성하고 대시보드로 이동
      signIn("google", { callbackUrl: "/dashboard" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "회원가입 실패",
        description: error.message,
      });
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">회원가입</CardTitle>
        <CardDescription>추가 정보를 입력해주세요.</CardDescription>
      </CardHeader>
      <Form {...form}>
        {/* form.handleSubmit(onSubmit)을 사용합니다. */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {/* 닉네임 필드 */}
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl><Input placeholder="사용할 닉네임" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 아이디 필드 */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아이디</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="사용할 아이디" {...field} onChange={(e) => { field.onChange(e); setUsernameStatus('idle'); }} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleCheckUsername} disabled={isCheckingUsername}>
                      {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : "중복 확인"}
                    </Button>
                  </div>
                  {usernameStatus === 'available' && <p className="text-sm text-green-600 flex items-center gap-1 mt-2"><CheckCircle className="h-4 w-4" /> 사용 가능한 아이디입니다.</p>}
                  {usernameStatus === 'unavailable' && <p className="text-sm text-red-600 flex items-center gap-1 mt-2"><XCircle className="h-4 w-4" /> 이미 존재하는 아이디입니다.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 비밀번호 필드 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            {/* 버튼의 비활성화는 form.formState.isSubmitting으로 제어 */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin mr-2" />}
              {isSubmitting ? '가입 진행 중...' : '회원가입'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}