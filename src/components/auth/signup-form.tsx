"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useState, useTransition } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 회원가입 처리를 위한 서버 액션 import
import { completeSignUp } from "@/app/auth/actions";


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
  const [isPending, startTransition] = useTransition();
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
      name: searchParams.get("name") || "",
      image: searchParams.get("image") || "",
      nickname: "",
      username: "",
      password: "",
    },
  });

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // 1. onSubmit 함수가 시작되었는지 확인
    console.log("Form submission started. Values:", values);

    startTransition(async () => {
        // 2. startTransition 콜백이 실행되는지 확인
        console.log("Submission transition has started.");
        try {
            // 3. 서버 액션 호출 직전에 로그 출력
            console.log("Attempting to call 'completeSignUp' server action...");
            const result = await completeSignUp(values);

            // 4. 서버 액션의 결과를 확인
            console.log("Server action result:", result);

            if (result?.error) {
                console.error("Error from server action:", result.error);
                throw new Error(result.error);
            }

            // 5. 회원가입 성공 및 로그인 시도 직전에 로그 출력
            console.log("Sign up successful. Attempting to call signIn('google').");
            toast({ title: "회원가입 성공", description: "로그인을 진행합니다." });
            signIn("google", { callbackUrl: "/dashboard" });

        } catch (error: any) {
            // 6. 에러가 발생했다면 콘솔에 상세히 기록
            console.error("Caught an error during the signup process:", error);
            toast({
                variant: "destructive",
                title: "회원가입 실패",
                description: error.message,
            });
        } finally {
            console.log("Submission transition finished.");
        }
    });
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">회원가입</CardTitle>
            <CardDescription>추가 정보를 입력해주세요.</CardDescription>
        </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {/* 이메일 FormField 제거 */}
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl>
                    <Input placeholder="사용할 닉네임" {...field} disabled={isPending} />
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
                      <Input
                        placeholder="사용할 아이디"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setUsernameStatus('idle');
                        }}
                        disabled={isPending}
                      />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleCheckUsername} disabled={usernameStatus === 'checking' || isPending}>
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
                    <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending || usernameStatus !== 'available'}>
              {isPending && <Loader2 className="animate-spin mr-2" />}
              {isPending ? '가입 중...' : '회원가입 완료'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 