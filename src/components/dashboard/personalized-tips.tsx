"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { generateTipsAction } from "@/app/dashboard/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PersonalizedTips() {
  const [tips, setTips] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateTips = () => {
    startTransition(async () => {
      const result = await generateTipsAction();
      if (result.success) {
        setTips(result.tips);
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: result.error,
        });
      }
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">AI 코치</CardTitle>
        </div>
        <CardDescription>
          당신의 성과에 기반한 개인화된 팁과 챌린지를 받아보세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isPending ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">게임 플레이를 분석 중입니다...</p>
          </div>
        ) : tips ? (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>당신을 위한 개인화된 팁</AlertTitle>
            <AlertDescription>
              <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: tips.replace(/\n/g, '<br />') }} />
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-full flex flex-col justify-center items-center">
             <p className="mb-4">버튼을 클릭하여 첫 개인화된 팁을 생성하세요.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateTips} disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isPending ? "생성 중..." : "팁 생성하기"}
        </Button>
      </CardFooter>
    </Card>
  );
}
