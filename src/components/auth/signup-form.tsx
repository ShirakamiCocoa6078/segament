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
import { Loader2 } from "lucide-react";
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            const result = await completeSignUp(values);
            if(result.error) {
                throw new Error(result.error);
            }
            toast({ title: "회원가입 성공", description: "로그인을 진행합니다." });
            // 회원가입 성공 후 Google로 다시 로그인 시도
            signIn("google", { callbackUrl: "/dashboard" });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "회원가입 실패",
                description: error.message,
            });
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
                  <FormControl>
                    <Input placeholder="사용할 아이디" {...field} disabled={isPending} />
                  </FormControl>
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin mr-2" />}
              {isPending ? '가입 중...' : '회원가입 완료'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 