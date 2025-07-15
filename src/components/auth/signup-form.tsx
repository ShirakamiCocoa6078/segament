"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signUpUser } from "@/app/auth/actions";

// 스키마에서 이메일 관련 정의를 완전히 제거합니다.
const formSchema = z.object({
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
  username: z.string().min(4, "아이디는 4자 이상이어야 합니다."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const isGoogleSignUp = useMemo(() => searchParams.has("email"), [searchParams]);
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'unavailable'>('idle');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { nickname: "", username: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  const handleCheckUsername = async () => { /* 이전과 동일 */ };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (usernameStatus !== 'available') {
        toast({ variant: "destructive", title: "확인 필요", description: "아이디 중복 확인을 진행해주세요." });
        return;
    }

    try {
      let submissionData: any = { ...values };
      // Google 연동 가입일 경우에만, 숨겨진 이메일 정보를 추가합니다.
      if (isGoogleSignUp) {
        submissionData.email = searchParams.get("email");
      }
      
      const result = await signUpUser(submissionData);
      if (result.error) throw new Error(result.error);

      toast({ title: "회원가입 완료", description: "로그인 페이지로 이동합니다. 다시 로그인 해주세요." });
      router.push('/');
        
    } catch (error: any) {
      toast({ variant: "destructive", title: "회원가입 실패", description: error.message });
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">회원가입</CardTitle>
        <CardDescription>{isGoogleSignUp ? "추가 정보를 입력해주세요." : "계정 정보를 입력해주세요."}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {/* 이메일 입력 필드가 완전히 제거되었습니다. */}
            
            {/* 닉네임, 아이디, 비밀번호 필드 */}
            <FormField control={form.control} name="nickname" render={/* ... */ } />
            <FormField control={form.control} name="username" render={/* ... */ } />
            <FormField control={form.control} name="password" render={/* ... */ } />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin mr-2" />}
              {isSubmitting ? '가입 진행 중...' : '회원가입 완료'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}