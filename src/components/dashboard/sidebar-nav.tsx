"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SegamentLogo, ChunithmIcon, MaimaiIcon } from "@/components/icons";
import { LayoutDashboard, ChevronRight, Settings } from "lucide-react";

// 프로필 데이터 타입 정의
interface GameProfile {
  id: string;
  playerName: string;
  gameType: string;
  region: string;
  userId: string;
}

// 캐시 관리 유틸리티
const CACHE_KEY = 'segament_profiles_cache';
const CACHE_EXPIRY_KEY = 'segament_profiles_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5분

const getCachedProfiles = (): GameProfile[] | null => {
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    const now = Date.now();
    
    if (!expiry || now > parseInt(expiry)) {
      // 캐시 만료
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      return null;
    }
    
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCachedProfiles = (profiles: GameProfile[]) => {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    localStorage.setItem(CACHE_KEY, JSON.stringify(profiles));
    localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
  } catch {
    // localStorage 실패 시 무시
  }
};

const clearProfilesCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
  } catch {
    // localStorage 실패 시 무시
  }
};

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfiles = useCallback(async (useCache = true) => {
    if (!session?.user?.id) return;
    
    // 캐시 확인
    if (useCache) {
      const cachedProfiles = getCachedProfiles();
      if (cachedProfiles) {
        setProfiles(cachedProfiles);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (data.profiles) {
        const profilesWithUserId = data.profiles.map((profile: any) => ({
          ...profile,
          userId: session.user.id
        }));
        
        setProfiles(profilesWithUserId);
        setCachedProfiles(profilesWithUserId);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // 북마크릿 업데이트 감지를 위한 이벤트 리스너
  useEffect(() => {
    const handleProfileUpdate = () => {
      clearProfilesCache();
      fetchProfiles(false); // 캐시 사용하지 않고 새로 가져오기
    };

    // 커스텀 이벤트 리스너 추가 (북마크릿에서 dispatch 할 수 있도록)
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [fetchProfiles]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfiles();
    }
  }, [session?.user?.id, fetchProfiles]);

  // 게임별 프로필 그룹화
  const chunithmProfiles = profiles.filter(p => p.gameType === 'CHUNITHM');
  const maimaiProfiles = profiles.filter(p => p.gameType === 'MAIMAI');

  return (
    <>
      <SidebarHeader>
        <Link href={session?.user?.userId ? `/${session.user.userId}/dashboard` : "/"} className="flex items-center gap-2">
          <SegamentLogo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            Segament
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* 츄니즘 */}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "츄니즘" }}>
              <ChunithmIcon className="h-5 w-5" />
              <span>츄니즘</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              {chunithmProfiles.length > 0 ? (
                chunithmProfiles.map((profile) => (
                  <SidebarMenuSubItem key={profile.id}>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/${profile.userId}/dashboard/detail/chunithm/${profile.region.toLowerCase()}`}>
                        <span>{profile.playerName} ({profile.region})</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))
              ) : (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton className="cursor-not-allowed opacity-50">
                    <span className="text-muted-foreground">프로필이 존재하지 않습니다.</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}
            </SidebarMenuSub>
          </SidebarMenuItem>

          {/* 마이마이 */}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "마이마이" }}>
              <MaimaiIcon className="h-5 w-5" />
              <span>마이마이</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton className="cursor-not-allowed opacity-50">
                  <span className="text-muted-foreground">개발중, 사용 불가</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>

          {/* 츄니즘 도구 */}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "츄니즘 도구" }}>
              <ChunithmIcon className="h-5 w-5" />
              <span>츄니즘 도구</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href={`/${session?.user?.userId}/dashboard/detail/chunithm/playPercent`}>
                    <span>순회 진행도(개발중)</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href={`/${session?.user?.userId}/dashboard/detail/chunithm/ratingHistory`}>
                    <span>레이팅 성장 그래프(개발중)</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href={`/${session?.user?.userId}/chunithm/calc/const`}>
                    <span>상수 계산기</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton className="cursor-not-allowed opacity-50">
                  <span className="text-muted-foreground">레이팅 계산기</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>

          {/* 마이마이 도구 */}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "마이마이 도구" }}>
              <MaimaiIcon className="h-5 w-5" />
              <span>마이마이 도구</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton className="cursor-not-allowed opacity-50">
                  <span className="text-muted-foreground">도구가 존재하지 않습니다.</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="#">
              <SidebarMenuButton tooltip={{ children: "설정" }}>
                <Settings className="h-5 w-5" />
                <span>설정</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
