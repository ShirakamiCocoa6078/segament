"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileDisplay } from "@/components/dashboard/profile-display";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Slider } from "@/components/ui/slider";
import { Line } from "react-chartjs-2";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

export default function ChunithmRatingHistoryPage() {
  // 디버깅용 버튼 상태 및 함수들 (최상단에 한 번만 선언)
  const [debugLoading, setDebugLoading] = useState(false);
  async function debugFetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      console.log("[DEBUG] /api/dashboard 응답:", data);
    } catch (e) {
      console.error("[DEBUG] /api/dashboard 에러:", e);
    }
  }
  async function debugFetchUpdateProfile() {
    try {
      const res = await fetch("/api/account/update-profile", { method: "POST" });
      const data = await res.json();
      console.log("[DEBUG] /api/account/update-profile 응답:", data);
    } catch (e) {
      console.error("[DEBUG] /api/account/update-profile 에러:", e);
    }
  }
  async function debugFetchPublicProfile(userId: string) {
    try {
      const res = await fetch(`/api/profile/public/${userId}`);
      const data = await res.json();
      console.log(`[DEBUG] /api/profile/public/${userId} 응답:`, data);
    } catch (e) {
      console.error(`[DEBUG] /api/profile/public/${userId} 에러:`, e);
    }
  }
  // 로그인 세션 확인
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    // next-auth 세션 fetch
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data));
  }, []);
  const params = useParams();
  const userId = params?.userId as string;
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  // CHUNITHM 모든 프로필 필터링 (isPublic 관계없이)
  const chunithmProfiles = Array.isArray(profiles)
    ? profiles.filter((p: any) => {
        // 필드 존재 여부 및 값 타입 체크
        if (!p) return false;
        if (typeof p.gameType !== 'string') {
          console.warn('gameType 필드가 string이 아님:', p);
          return false;
        }
        // 대소문자 무시 비교
        return p.gameType.trim().toUpperCase() === 'CHUNITHM';
      })
    : [];
  // 콘솔 로그로 데이터 흐름 확인
  useEffect(() => {
    console.log('[DEBUG] profiles:', profiles);
    console.log('[DEBUG] chunithmProfiles:', chunithmProfiles);
    if (profiles.length > 0) {
      profiles.forEach((p, idx) => {
        console.log(`[DEBUG] profiles[${idx}]:`, p);
      });
    }
    if (chunithmProfiles.length > 0) {
      chunithmProfiles.forEach((p, idx) => {
        console.log(`[DEBUG] chunithmProfiles[${idx}]:`, p);
      });
    }
  }, [profiles, chunithmProfiles]);
  // 선택된 프로필
  let selectedProfile = chunithmProfiles.find(p => p.id === selectedProfileId);
  // ratingHistory 파싱 결과를 별도 변수에 저장
  let parsedRatingHistory: any = undefined;
  if (selectedProfile) {
    if (typeof selectedProfile.ratingHistory === 'string') {
      try {
        parsedRatingHistory = JSON.parse(selectedProfile.ratingHistory);
      } catch (e) {
        parsedRatingHistory = undefined;
      }
    } else {
      parsedRatingHistory = selectedProfile.ratingHistory;
    }
  }
  // 디버그 버튼 클릭 핸들러
  const handleDebugClick = () => {
    console.log('profiles:', profiles);
    console.log('selectedProfile:', selectedProfile);
    if (selectedProfile && selectedProfile.ratingHistory) {
      console.log('ratingHistory:', selectedProfile.ratingHistory);
    } else {
      console.log('ratingHistory: 없음 또는 profile이 undefined');
    }
    if (typeof displayEntries !== 'undefined') {
      console.log('displayEntries:', displayEntries);
    }
    if (typeof data !== 'undefined') {
      console.log('chart data:', data);
    }
  };
  const [sliderValue, setSliderValue] = useState<number>(100);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfiles() {
      try {
        // session은 내부에서만 체크
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (isMounted) {
          setProfiles(data.profiles || []);
          // CHUNITHM 모든 프로필 필터링 (isPublic 관계없이)
          const chunithmProfiles = Array.isArray(data.profiles)
            ? data.profiles.filter((p: any) => p.gameType === 'CHUNITHM')
            : [];
          if (chunithmProfiles.length > 0) {
            // INTL > JP > 기타
            const intlProfile = chunithmProfiles.find((p: any) => p.region === 'INTL');
            const jpProfile = chunithmProfiles.find((p: any) => p.region === 'JP');
            const defaultProfile = intlProfile || jpProfile || chunithmProfiles[0];
            // 현재 값과 다를 때만 setState
            if (defaultProfile.id !== selectedProfileId) {
              setSelectedProfileId(defaultProfile.id);
            }
          }
        }
      } catch (err) {
        // 에러 핸들링
      }
    }
    if (session && session.user && session.user.id) { fetchProfiles(); }
    return () => { isMounted = false; };
  }, [userId]);

  if (!selectedProfile || !selectedProfile.ratingHistory) {
  if (!session || !session.user || !session.user.id) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <Card>
            <h2 className="text-xl font-bold mb-2">레이팅 성장 그래프</h2>
            <p className="text-muted-foreground">로그인한 유저만 자신의 레이팅 성장 그래프를 볼 수 있습니다.</p>
          </Card>
          <Button variant="default" onClick={() => { window.location.href = '/api/auth/signin'; }}>로그인</Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <Card className="w-full max-w-2xl min-h-[220px] flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4">레이팅 성장 그래프</h2>
          <div className="w-full max-w-md mx-auto mb-4">
            {chunithmProfiles.length > 0 && (
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-full h-9 text-sm">
                  <SelectValue placeholder="프로필 선택" />
                </SelectTrigger>
                <SelectContent>
                  {chunithmProfiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.region ? `${p.region} - ${p.playerName}` : p.playerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <p className="text-muted-foreground mb-2">{chunithmProfiles.length === 0 ? '츄니즘 게임 프로필이 없습니다.' : '해당 프로필에 레이팅 히스토리 데이터가 없습니다.'}</p>
          <Button variant="outline" onClick={() => { window.location.href = `/${session.user.id}/dashboard`; }}>내 대시보드로 이동</Button>
        </Card>
      </div>
    );
  }

  // ratingHistory: { '2025-08-12|11:04': 14.32, ... }
  const entries = parsedRatingHistory
    ? Object.entries(parsedRatingHistory).sort((a, b) => a[0].localeCompare(b[0]))
    : [];
  const total = entries.length;
  const displayCount = Math.max(5, Math.floor((sliderValue / 100) * total));
  const displayEntries = entries.slice(total - displayCount);

  // 디버깅: 데이터 구조 확인 (useEffect로 브라우저 콘솔에 출력)
  React.useEffect(() => {
    console.log('profiles 전체 구조:', JSON.stringify(profiles, null, 2));
    profiles.forEach((p, idx) => {
      console.log(`profiles[${idx}] keys:`, Object.keys(p));
      console.log(`profiles[${idx}].id:`, p.id);
      console.log(`profiles[${idx}].ratingHistory 타입:`, typeof p.ratingHistory);
      console.log(`profiles[${idx}].ratingHistory 값:`, p.ratingHistory);
    });
    if (selectedProfile) {
      console.log('selectedProfile keys:', Object.keys(selectedProfile));
      console.log('selectedProfile.id:', selectedProfile.id);
      console.log('selectedProfile.ratingHistory 타입:', typeof selectedProfile.ratingHistory);
      console.log('selectedProfile.ratingHistory 값:', selectedProfile.ratingHistory);
      if (selectedProfile.ratingHistory && typeof selectedProfile.ratingHistory === 'object') {
        const keys = Object.keys(selectedProfile.ratingHistory);
        console.log('selectedProfile.ratingHistory keys:', keys);
        if (keys.length === 0) {
          console.log('selectedProfile.ratingHistory: 빈 객체');
        }
      } else if (selectedProfile.ratingHistory === undefined) {
        console.log('selectedProfile.ratingHistory: undefined');
      } else if (selectedProfile.ratingHistory === null) {
        console.log('selectedProfile.ratingHistory: null');
      }
    } else {
      console.log('selectedProfile: 없음');
    }
    console.log('displayEntries:', displayEntries);
    console.log('chart data:', data);
  }, [profiles, selectedProfile, displayEntries]);
  const data = {
    labels: displayEntries.map(([date]) => date.split('|')[0]),
    datasets: [
      {
        label: "레이팅",
        data: displayEntries.map(([, rating]) => Number(rating)),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.2,
      },
    ],
  };
  console.log('chart data:', data);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: "날짜" } },
      y: { title: { display: true, text: "레이팅" }, min: 0, max: 20 },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* 항상 보이는 디버깅 버튼 */}
      <div className="my-4 flex gap-2">
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded"
          disabled={debugLoading}
          onClick={async () => {
            setDebugLoading(true);
            await debugFetchDashboard();
            setDebugLoading(false);
          }}
        >
          /api/dashboard 호출
        </button>
        <button
          className="px-2 py-1 bg-green-500 text-white rounded"
          disabled={debugLoading}
          onClick={async () => {
            setDebugLoading(true);
            await debugFetchUpdateProfile();
            setDebugLoading(false);
          }}
        >
          /api/account/update-profile 호출
        </button>
        <button
          className="px-2 py-1 bg-purple-500 text-white rounded"
          disabled={debugLoading}
          onClick={async () => {
            setDebugLoading(true);
            await debugFetchPublicProfile(userId);
            setDebugLoading(false);
          }}
        >
          /api/profile/public/[userId] 호출
        </button>
      </div>
      {/* ...기존 Card 및 그래프 UI... */}
      <Card className="w-full max-w-2xl min-h-[220px] flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">레이팅 성장 그래프</h2>
        <div className="w-full max-w-md mx-auto mb-4">
          {chunithmProfiles.length > 0 && (
            <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
              <SelectTrigger className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-full h-9 text-sm">
                <SelectValue placeholder="프로필 선택" />
              </SelectTrigger>
              <SelectContent>
                {chunithmProfiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.region ? `${p.region} - ${p.playerName}` : p.playerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {/* ratingHistory가 object일 때만 차트 렌더링 */}
        {selectedProfile && parsedRatingHistory && typeof parsedRatingHistory === 'object' ? (
          <>
            <Line data={data} options={options} />
            <div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-muted-foreground">표시 구간 조절</label>
              <Slider min={5} max={100} step={1} value={[sliderValue]} onValueChange={v => setSliderValue(v[0])} />
              <div className="mt-2 text-xs text-muted-foreground">최근 {displayCount}개 데이터 표시</div>
            </div>
            <Button variant="secondary" className="mt-4" onClick={handleDebugClick}>디버그 출력</Button>
          </>
        ) : (
          <div className="mt-6 text-muted-foreground">선택한 프로필에 레이팅 히스토리 데이터가 없습니다.</div>
        )}
      </Card>
    </div>
  );
}
