"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { SegamentLogo, ChunithmIcon, MaimaiIcon } from "@/components/icons";
import { LayoutDashboard, Bot, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/dashboard/chunithm", label: "츄니즘", icon: ChunithmIcon },
  { href: "/dashboard/maimai", label: "마이마이", icon: MaimaiIcon },
  { href: "/dashboard/coach", label: "AI 코치", icon: Bot },
];

export function SidebarNav() {
  const pathname = usePathname();

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
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href="#">
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
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
