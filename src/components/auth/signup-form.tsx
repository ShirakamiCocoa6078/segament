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

// 사용자가 직접 입력하는 필드만 유효성을 검사합니다.
const formSchema = z.object({
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
  username: z.string().min(4, "아이디는 4자 이상이어야 합니다."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // URL 파라미터를 통해 Google 연동 가입인지 확인
  const isGoogleSignUp = useMemo(() => searchParams.has("email"), [searchParams]);
  const googleEmail = useMemo(() => searchParams.get("email"), [searchParams]);

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
    if (usernameStatus !== 'available' && !isGoogleSignUp) { // 일반 가입 시에는 중복 확인 필수
        toast({ variant: "destructive", title: "확인 필요", description: "아이디 중복 확인을 진행해주세요." });
        return;
    }

    try {
      // Google 연동 가입일 경우, email 정보를 함께 보냅니다.
      const submissionData = isGoogleSignUp ? { ...values, email: googleEmail } : values;
      
      const result = await signUpUser(submissionData);
      if (result.error) throw new Error(result.error);

      toast({ title: "회원가입 완료", description: "로그인 페이지로 이동합니다. 다시 로그인 해주세요." });
      router.push('/');
        
    } catch (error: any) {
      toast({ variant: "destructive", title: "회원가입 실패", description: error.message });
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          {isGoogleSignUp ? "마지막 단계입니다! 사용할 정보를 입력해주세요." : "계정 정보를 입력해주세요."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {/* 닉네임, 아이디, 비밀번호 입력 필드 */}
            <FormField control={form.control} name="nickname" render={/* ... */ } />
            <FormField control={form.control} name="username" render={/* ... */ } />
            <FormField control={form.control} name="password" render={/* ... */ } />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              회원가입 완료
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}