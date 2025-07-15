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
import { universalSignUp } from "@/app/auth/actions"; // 서버 액션 import

// Zod 스키마: 하나의 스키마로 두 가지 경우를 모두 처리합니다.
const formSchema = z.object({
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
  username: z.string().min(4, "아이디는 4자 이상이어야 합니다."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
  // 일반 가입 시에만 이메일을 입력받으므로, optional()로 설정합니다.
  newEmail: z.string().email("유효한 이메일을 입력해주세요.").optional(),
}).refine(data => {
    // isGoogleSignUp이 아닐 때 (즉, 일반 회원가입일 때) newEmail 필드가 반드시 존재해야 함
    // isGoogleSignUp은 이 컴포넌트 외부의 값이므로, form.handleSubmit 내부에서 체크합니다.
    return true; // refine은 스키마 레벨에서 구조만 정의하고, 실제 로직은 onSubmit에서 처리
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
    defaultValues: {
      nickname: "",
      username: "",
      password: "",
      newEmail: "",
    },
  });

  const { isSubmitting } = form.formState;

  const handleCheckUsername = async () => { /* 이전과 동일 */ };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // 일반 회원가입인데 이메일이 없는 경우, 수동으로 에러를 발생시킵니다.
    if (!isGoogleSignUp && !values.newEmail) {
        form.setError("newEmail", { type: "manual", message: "이메일을 입력해주세요." });
        return;
    }
    if (usernameStatus !== 'available') {
      toast({ variant: "destructive", title: "확인 필요", description: "아이디 중복 확인을 진행해주세요." });
      return;
    }

    try {
      let submissionData: any = { ...values };
      if (isGoogleSignUp) {
        submissionData.email = searchParams.get("email");
        submissionData.name = searchParams.get("name");
        submissionData.image = searchParams.get("image");
        delete submissionData.newEmail; // 불필요한 필드 제거
      } else {
        // 일반 가입 시에는 newEmail을 email 필드로 매핑
        submissionData.email = values.newEmail;
      }
      
      const result = await universalSignUp(submissionData);
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

            <FormField control={form.control} name="nickname" render={({ field }) => (
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl><Input placeholder="사용할 닉네임" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="username" render={({ field }) => (
                 <FormItem>
                   <FormLabel>아이디</FormLabel>
                   <div className="flex gap-2">
                     <FormControl>
                       <Input placeholder="사용할 아이디" {...field} onChange={(e) => {
                         field.onChange(e);
                         setUsernameStatus('idle');
                       }} />
                     </FormControl>
                     <Button type="button" variant="outline" onClick={handleCheckUsername} disabled={isCheckingUsername}>
                       {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : "중복 확인"}
                     </Button>
                   </div>
                   {usernameStatus === 'available' && <p className="text-sm text-green-600 flex items-center gap-1 mt-2"><CheckCircle className="h-4 w-4" /> 사용 가능한 아이디입니다.</p>}
                   {usernameStatus === 'unavailable' && <p className="text-sm text-red-600 flex items-center gap-1 mt-2"><XCircle className="h-4 w-4" /> 이미 존재하는 아이디입니다.</p>}
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
          <CardFooter>
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