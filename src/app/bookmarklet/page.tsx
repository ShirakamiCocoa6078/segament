'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download } from 'lucide-react';

export default function BookmarkletPage() {
  const [bookmarkletCode, setBookmarkletCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookmarkletCode = async () => {
      try {
        const response = await fetch('/segament-getChu.js');
        if (!response.ok) {
          throw new Error('Failed to fetch bookmarklet code');
        }
        const code = await response.text();
        setBookmarkletCode(code);
      } catch (error) {
        console.error('Error fetching bookmarklet code:', error);
        toast({
          title: "에러",
          description: "북마크릿 코드를 불러올 수 없습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkletCode();
  }, [toast]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      toast({
        title: "복사 완료",
        description: "코드가 복사되었습니다!",
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "에러",
        description: "복사에 실패했습니다. 수동으로 복사해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CHUNITHM 데이터 가져오기 북마크릿</h1>
        
        <div className="space-y-6">
          {/* 사용 방법 안내 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                사용 방법
              </CardTitle>
              <CardDescription>
                CHUNITHM-NET에서 플레이 데이터를 자동으로 가져오는 북마크릿입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">설치 및 사용 순서:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>아래 "북마크릿 복사하기" 버튼을 클릭하여 코드를 복사합니다.</li>
                    <li>브라우저에서 새 북마크를 생성합니다.</li>
                    <li>북마크의 <strong>URL 필드</strong>에 복사한 코드를 붙여넣습니다.</li>
                    <li>북마크 이름을 "Segament 데이터 가져오기" 등으로 설정합니다.</li>
                    <li>CHUNITHM-NET에 로그인한 상태에서 해당 북마크를 클릭합니다.</li>
                    <li>자동으로 데이터가 수집되어 Segament로 전송됩니다.</li>
                  </ol>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-amber-800">⚠️ 주의사항:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                    <li>CHUNITHM-NET에 먼저 로그인되어 있어야 합니다.</li>
                    <li>Segament에도 로그인되어 있어야 하며, CHUNITHM 프로필이 생성되어 있어야 합니다.</li>
                    <li>데이터 수집에는 시간이 걸릴 수 있습니다.</li>
                    <li>팝업 차단기가 활성화되어 있으면 정상 작동하지 않을 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 북마크릿 코드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  북마크릿 코드
                </span>
                <Button 
                  onClick={copyToClipboard}
                  disabled={isLoading || !bookmarkletCode}
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  북마크릿 복사하기
                </Button>
              </CardTitle>
              <CardDescription>
                이 코드를 브라우저 북마크의 URL 필드에 붙여넣어 사용하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={isLoading ? '북마크릿 코드를 불러오는 중...' : bookmarkletCode}
                readOnly
                rows={15}
                className="font-mono text-xs"
                placeholder="북마크릿 코드가 여기에 표시됩니다..."
              />
              {!isLoading && !bookmarkletCode && (
                <p className="text-sm text-muted-foreground mt-2">
                  북마크릿 코드를 불러올 수 없습니다. /public/segament-getChu.js 파일을 확인해주세요.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>문제 해결</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold">북마크릿이 작동하지 않는 경우:</h4>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>CHUNITHM-NET에 로그인되어 있는지 확인</li>
                    <li>Segament에 로그인되어 있는지 확인</li>
                    <li>CHUNITHM 프로필이 생성되어 있는지 확인</li>
                    <li>브라우저의 팝업 차단 설정 확인</li>
                    <li>개발자 도구(F12)에서 콘솔 에러 메시지 확인</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">데이터가 정상적으로 가져와지지 않는 경우:</h4>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>잠시 후 다시 시도해보세요</li>
                    <li>CHUNITHM-NET의 페이지 구조가 변경되었을 가능성이 있습니다</li>
                    <li>문제가 지속되면 개발팀에 문의해주세요</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
