"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
}

export function SidebarNav() {
  const pathname = usePathname();
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  // 사용자 프로필 데이터 가져오기
  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.profiles) {
          setProfiles(data.profiles);
        }
      })
      .catch(console.error);
  }, []);

  // 게임별 프로필 그룹화
  const chunithmProfiles = profiles.filter(p => p.gameType === 'CHUNITHM');
  const maimaiProfiles = profiles.filter(p => p.gameType === 'MAIMAI');

  // 게임 확장/축소 토글
  const toggleGame = (gameType: string) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameType)) {
      newExpanded.delete(gameType);
    } else {
      newExpanded.add(gameType);
    }
    setExpandedGames(newExpanded);
  };

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <SegamentLogo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            Segament
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* 대시보드 메뉴 */}
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton
                isActive={pathname === '/dashboard'}
                tooltip={{ children: "대시보드" }}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>대시보드</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* 츄니즘 메뉴 */}
          <Collapsible open={expandedGames.has('CHUNITHM')} onOpenChange={() => toggleGame('CHUNITHM')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={{ children: "츄니즘" }}
                  onClick={() => toggleGame('CHUNITHM')}
                >
                  <ChunithmIcon className="h-5 w-5" />
                  <span>츄니즘</span>
                  <ChevronRight 
                    className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                      expandedGames.has('CHUNITHM') ? 'rotate-90' : ''
                    }`} 
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {chunithmProfiles.length > 0 ? (
                    chunithmProfiles.map((profile) => (
                      <Collapsible key={profile.id}>
                        <SidebarMenuSubItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton>
                              <span>{profile.playerName} ({profile.region})</span>
                              <ChevronRight className="ml-auto h-3 w-3" />
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <Link href={`/dashboard/detail/chunithm/${profile.id}`}>
                                  <SidebarMenuSubButton>
                                    <span>곡 프로필</span>
                                  </SidebarMenuSubButton>
                                </Link>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <Link href={`/dashboard/detail/chunithm/playPercent`}>
                                  <SidebarMenuSubButton>
                                    <span>순회 진행도</span>
                                  </SidebarMenuSubButton>
                                </Link>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuSubItem>
                      </Collapsible>
                    ))
                  ) : (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton className="cursor-not-allowed opacity-50">
                        <span className="text-muted-foreground">프로필이 존재하지 않습니다.</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          {/* 마이마이 메뉴 */}
          <Collapsible open={expandedGames.has('MAIMAI')} onOpenChange={() => toggleGame('MAIMAI')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={{ children: "마이마이" }}
                  onClick={() => toggleGame('MAIMAI')}
                >
                  <MaimaiIcon className="h-5 w-5" />
                  <span>마이마이</span>
                  <ChevronRight 
                    className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                      expandedGames.has('MAIMAI') ? 'rotate-90' : ''
                    }`} 
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {maimaiProfiles.length > 0 ? (
                    maimaiProfiles.map((profile) => (
                      <Collapsible key={profile.id}>
                        <SidebarMenuSubItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton>
                              <span>{profile.playerName} ({profile.region})</span>
                              <ChevronRight className="ml-auto h-3 w-3" />
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <Link href={`/dashboard/detail/maimai/${profile.id}`}>
                                  <SidebarMenuSubButton>
                                    <span>곡 프로필</span>
                                  </SidebarMenuSubButton>
                                </Link>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <Link href={`/dashboard/detail/maimai/playPercent`}>
                                  <SidebarMenuSubButton>
                                    <span>순회 진행도</span>
                                  </SidebarMenuSubButton>
                                </Link>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuSubItem>
                      </Collapsible>
                    ))
                  ) : (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton className="cursor-not-allowed opacity-50">
                        <span className="text-muted-foreground">프로필이 존재하지 않습니다.</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
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
