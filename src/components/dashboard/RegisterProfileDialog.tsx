// 파일 경로: src/components/dashboard/RegisterProfileDialog.tsx

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { bookmarkletLoaderCode } from '@/lib/bookmarklet';
import { useState } from 'react';

export default function RegisterProfileDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletLoaderCode);
    toast({
      title: '성공',
      description: '북마크릿 코드가 클립보드에 복사되었습니다!',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>게임 프로필 등록하기</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>게임 프로필 등록</DialogTitle>
          <DialogDescription>
            아래의 안내에 따라 데이터를 가져와주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-sm">
            <p className="font-bold">1. 아래 버튼을 눌러 북마크릿 코드를 복사하세요.</p>
            <Button onClick={handleCopy} className="w-full mt-2">
              Segament 만능 북마크릿 복사하기
            </Button>
          </div>
          <div className="text-sm">
            <p className="font-bold">2. 브라우저에 새 북마크를 만들고, 'URL' 또는 '주소' 필드에 복사한 코드를 붙여넣으세요.</p>
            <p className="text-xs text-muted-foreground mt-1">
              (이름은 'Segament 가져오기' 등으로 설정하면 편리합니다.)
            </p>
          </div>
           <div className="text-sm">
            <p className="font-bold">3. CHUNITHM-NET 등 공식 사이트에 로그인 후, 방금 만든 북마크릿을 클릭하세요.</p>
             <p className="text-xs text-muted-foreground mt-1">
              데이터 가져오기가 완료되면 이 페이지는 자동으로 새로고침될 수 있습니다.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
