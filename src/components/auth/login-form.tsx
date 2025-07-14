"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

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
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  password: z.string().min(1, {
    message: "비밀번호를 입력해주세요.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "test@test.com",
      password: "test1234",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
        // Mock authentication
        setTimeout(() => {
            router.push("/dashboard");
        }, 1000)
    });
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">다시 오신 것을 환영합니다</CardTitle>
            <CardDescription>사이트를 이용하려면 로그인하세요.</CardDescription>
        </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input placeholder="player@example.com" {...field} disabled={isPending} />
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
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isPending ? '로그인 중...' : '로그인'}
            </Button>
            <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full" />
                <span className="relative bg-card px-2 text-xs text-muted-foreground">또는</span>
            </div>
             <div className="flex gap-4">
                <Button variant="outline" className="w-full">회원가입</Button>
                <Button variant="outline" className="w-full">소셜 로그인</Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
