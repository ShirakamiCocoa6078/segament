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
// 새로 만든 universalSignUp 서버 액션을 import 합니다.
import { universalSignUp } from "@/app/auth/actions";

// Zod 스키마를 유동적으로 사용하기 위해 분리합니다.
const baseSchema = {
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
  username: z.string().min(4, "아이디는 4자 이상이어야 합니다."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
};

const googleSignupSchema = z.object(baseSchema);
const standardSignupSchema = z.object({
  ...baseSchema,
  newEmail: z.string().email("유효한 이메일을 입력해주세요."), // 일반 가입 시에는 이메일도 검사
});


export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // URL 파라미터를 통해 Google 연동 가입인지 일반 가입인지 구분합니다.
  const isGoogleSignUp = useMemo(() => searchParams.has("email"), [searchParams]);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'unavailable'>('idle');

  const form = useForm({
    // 모드에 따라 다른 Zod 스키마를 적용합니다.
    resolver: zodResolver(isGoogleSignUp ? googleSignupSchema : standardSignupSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: "",
      username: "",
      password: "",
      newEmail: "", // 일반 가입용 이메일 필드
    },
  });

  const { isSubmitting } = form.formState;

  const handleCheckUsername = async () => { /* 이전과 동일 */ };

  const onSubmit = async (values: any) => {
    if (usernameStatus !== 'available') {
        toast({ variant: "destructive", title: "확인 필요", description: "아이디 중복 확인을 진행해주세요." });
        return;
    }

    try {
        let submissionData = { ...values };
        if (isGoogleSignUp) {
            submissionData.email = searchParams.get("email");
            submissionData.name = searchParams.get("name");
            submissionData.image = searchParams.get("image");
        }

        const result = await universalSignUp(submissionData);
        if (result.error) throw new Error(result.error);

        toast({ title: "회원가입 완료", description: "로그인 페이지로 이동합니다. 다시 로그인 해주세요." });
        router.push('/'); // 모든 경우에 로그인 페이지로 이동
        
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
            
            {/* 일반 회원가입일 때만 이메일 입력창을 보여줍니다. */}
            {!isGoogleSignUp && (
              <FormField
                control={form.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl><Input type="email" placeholder="example@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 나머지 닉네임, 아이디, 비밀번호 필드는 공통으로 사용 */}
            <FormField name="nickname" control={form.control} render={/* ... */ } />
            <FormField name="username" control={form.control} render={/* ... */ } />
            <FormField name="password" control={form.control} render={/* ... */ } />

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