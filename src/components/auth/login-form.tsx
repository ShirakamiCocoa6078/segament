"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, { message: "아이디를 입력해주세요." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  // 아이디/비밀번호 로그인 제출 함수
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      username: values.username,
      password: values.password,
    });

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: result.error,
      });
    } else {
      // 로그인 성공 시 사용자 정보를 확인하여 올바른 대시보드로 이동
      try {
        const userResponse = await fetch('/api/user/profile-status');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.user?.id) {
            router.push(`/${userData.user.id}/dashboard`);
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error('Failed to get user data:', error);
        router.push("/");
      }
    }
    setIsLoading(false);
  };

  // Google 로그인 처리 함수
  // Google 로그인 처리 함수
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // callbackUrl을 새로운 확인 페이지로 지정합니다.
    signIn("google", { callbackUrl: "/auth/verify" });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>계정에 로그인하세요.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>아이디</FormLabel>
                <FormControl><Input placeholder="아이디 입력" {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            {/* 일반 로그인 버튼: type="submit" */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin mr-2" />}
              로그인
            </Button>
            <div className="relative w-full flex items-center">
              <Separator className="flex-1" />
              <span className="px-2 text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            {/* Google 로그인 버튼의 onClick 이벤트를 수정합니다. */}
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin mr-2" />}
              Google로 로그인
            </Button>
            <Link href="/signup" className="w-full">
              <Button variant="secondary" className="w-full" disabled={isLoading}>
                회원가입
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}