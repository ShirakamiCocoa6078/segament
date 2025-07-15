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
import { useState, useTransition } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { completeSignUp } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  nickname: z.string().min(2, { message: "닉네임은 2자 이상이어야 합니다." }),
  username: z.string().min(4, { message: "아이디는 4자 이상이어야 합니다." }),
  password: z.string().min(6, { message: "비밀번호는 6자 이상이어야 합니다." }),
  email: z.string().email(),
  name: z.string(),
  image: z.string().url().optional(),
});

type ShakeTarget = 'none' | 'nickname' | 'username' | 'password' | 'check-button';

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [shakeTarget, setShakeTarget] = useState<ShakeTarget>('none');
  const [shakeKey, setShakeKey] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // 유효성 검사 모드 변경
    defaultValues: {
      email: searchParams.get("email") || "",
      name: searchParams.get("name") || "",
      image: searchParams.get("image") || "",
      nickname: "",
      username: "",
      password: "",
    },
  });

  const triggerShake = (target: ShakeTarget) => {
    setShakeTarget(target);
    setShakeKey(prev => prev + 1);
  };
  
  const handleCheckUsername = async () => {
    const username = form.getValues("username");
    if (username.length < 4) {
        form.setError("username", { message: "아이디는 4자 이상이어야 합니다." });
        return;
    }
    setUsernameStatus('checking');
    try {
        const response = await fetch('/api/auth/check-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        const data = await response.json();
        if (response.ok) {
            setUsernameStatus(data.isAvailable ? 'available' : 'unavailable');
        } else {
            setUsernameStatus('idle');
            toast({ variant: "destructive", title: "오류", description: data.error || "아이디 확인 중 오류가 발생했습니다." });
        }
    } catch (error) {
        setUsernameStatus('idle');
        toast({ variant: "destructive", title: "오류", description: "네트워크 오류가 발생했습니다." });
    }
  }
  
  // 1. react-hook-form의 유효성 검사를 통과했을 때만 실행될 함수
  const onValidSubmit = (values: z.infer<typeof formSchema>) => {
    // 2. 아이디 중복 확인이 완료되었는지 최종 체크
    if (usernameStatus !== 'available') {
      triggerShake('check-button');
      toast({ variant: "destructive", title: "아이디 중복 확인 필요", description: "아이디 중복 확인을 해주세요." });
      return;
    }
    
    // 3. 모든 검사를 통과하면 서버로 데이터를 전송
    toast({ title: "회원가입 중...", description: "잠시만 기다려주세요." });
    startTransition(async () => {
      try {
        const result = await completeSignUp(values);
        if (result.error) {
          throw new Error(result.error);
        }
        toast({ title: "회원가입 성공", description: "로그인을 진행합니다." });
        signIn("google", { callbackUrl: "/dashboard" });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "회원가입 실패",
          description: error.message || "다시 시도해주세요.",
        });
      }
    });
  };
  
  // react-hook-form 유효성 검사 실패 시 실행될 함수
  const onInvalidSubmit = (errors: any) => {
    const errorField = Object.keys(errors)[0] as ShakeTarget;
    triggerShake(errorField);
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">회원가입</CardTitle>
        <CardDescription>추가 정보를 입력해주세요.</CardDescription>
      </CardHeader>
      <Form {...form}>
        {/* 4. form.handleSubmit을 사용하여 제출 로직을 연결합니다. */}
        <form onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl>
                    <Input placeholder="사용할 닉네임" {...field} disabled={isPending} className={cn(shakeKey > 0 && shakeTarget === 'nickname' && 'shake border-red-500/50')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아이디</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="사용할 아이디" {...field} onChange={(e) => { field.onChange(e); setUsernameStatus('idle'); }} disabled={isPending} className={cn(shakeKey > 0 && shakeTarget === 'username' && 'shake border-red-500/50')} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleCheckUsername} disabled={usernameStatus === 'checking' || isPending} className={cn(shakeKey > 0 && shakeTarget === 'check-button' && 'shake bg-red-500/10 border-red-500/50')}>
                      {usernameStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : "중복 확인"}
                    </Button>
                  </div>
                  {usernameStatus === 'available' && <p className="text-sm text-green-600 flex items-center gap-1 mt-2"><CheckCircle className="h-4 w-4" /> 사용 가능한 아이디입니다.</p>}
                  {usernameStatus === 'unavailable' && <p className="text-sm text-red-600 flex items-center gap-1 mt-2"><XCircle className="h-4 w-4" /> 이미 존재하는 아이디입니다.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isPending} className={cn(shakeKey > 0 && shakeTarget === 'password' && 'shake border-red-500/50')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            {/* 5. 버튼의 type을 "submit"으로 변경합니다. */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin mr-2" />}
              {isPending ? '가입 진행 중...' : '회원가입 완료'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 