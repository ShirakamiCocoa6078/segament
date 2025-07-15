"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false, // 직접 리디렉션 처리
      username: values.username,
      password: values.password,
    });

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: result.error,
      });
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
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
                <FormControl><Input placeholder="아이디 입력" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin mr-2" />}
              로그인
            </Button>
            <div className="relative w-full flex items-center">
              <Separator className="flex-1" />
              <span className="px-2 text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            <Button variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
              Google로 로그인
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}