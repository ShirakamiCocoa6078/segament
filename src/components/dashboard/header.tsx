"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<'pc' | 'mobile'>('pc');

  // 테마 로딩/저장
  useEffect(() => {
    const localTheme = localStorage.getItem('theme');
    if (localTheme === 'dark' || localTheme === 'light') {
      setTheme(localTheme);
    }
    const localMode = localStorage.getItem('uiMode');
    if (localMode === 'mobile' || localMode === 'pc') {
      setMode(localMode);
    }
  }, []);

  // 테마 변경 핸들러
  const handleThemeChange = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (session) {
      // TODO: 서버에 theme 저장 API 호출
    } else {
      localStorage.setItem('theme', nextTheme);
    }
    // Tailwind dark class 적용 (간단 예시)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 모드 변경 핸들러
  const handleModeChange = () => {
    const nextMode = mode === 'pc' ? 'mobile' : 'pc';
    setMode(nextMode);
    localStorage.setItem('uiMode', nextMode);
  };

  if (!session) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        {/* 모바일/PC 모드 전환 버튼 */}
        <button
          className="px-3 py-1 rounded border text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition"
          onClick={handleModeChange}
        >
          {mode === 'pc' ? '모바일 모드로 변경' : 'PC 모드로 변경'}
        </button>
  {/* next-themes 기반 ThemeToggle 드롭다운 */}
  <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session.user?.image ?? ""} alt={session.user?.name ?? ""} />
                  <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${session.user?.id}/account`}>
                <User className="mr-2 h-4 w-4"/>
                <span>프로필</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="mr-2 h-4 w-4"/>
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
