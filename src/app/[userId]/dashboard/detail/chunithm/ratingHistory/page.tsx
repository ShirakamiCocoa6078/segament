"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileDisplay } from "@/components/dashboard/profile-display";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Line } from "react-chartjs-2";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

export default function ChunithmRatingHistoryPage() {
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
  let selectedProfile = profiles.find(p => p.id === selectedProfileId);
  // ratingHistory가 string 타입으로 들어올 경우 파싱
  if (selectedProfile && typeof selectedProfile.ratingHistory === 'string') {
    try {
      selectedProfile = {
        ...selectedProfile,
        ratingHistory: JSON.parse(selectedProfile.ratingHistory)
      };
    } catch (e) {
      console.warn('ratingHistory JSON 파싱 실패:', e);
      selectedProfile.ratingHistory = undefined;
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
        // 로그인 유저만 개인 데이터 fetch
        if (!session || !session.user || !session.user.id) return;
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        const chunithmProfiles = Array.isArray(data.profiles)
          ? data.profiles.filter((p: any) => p.gameType === 'CHUNITHM')
          : [];
        if (isMounted) {
          setProfiles(chunithmProfiles);
          if (chunithmProfiles.length > 0) {
            const defaultProfile = chunithmProfiles.find((p: any) => p.ratingHistory) || chunithmProfiles[0];
            setSelectedProfileId(defaultProfile.id);
          }
        }
      } catch (err) {
        console.error('fetchProfiles error:', err);
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
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
        <Card>
          <h2 className="text-xl font-bold mb-2">레이팅 성장 그래프</h2>
          <p className="text-muted-foreground">해당 프로필에 레이팅 히스토리 데이터가 없습니다.</p>
        </Card>
        {profiles.length > 0 && (
          <select
            className="mt-4 mb-2 px-4 py-2 border rounded"
            value={selectedProfileId}
            onChange={e => setSelectedProfileId(e.target.value)}
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.region ? `${p.region} - ${p.playerName}` : p.playerName}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleDebugClick}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          디버그 출력
        </button>
        <Button variant="outline" onClick={() => { window.location.href = `/${session.user.id}/dashboard`; }}>내 대시보드로 이동</Button>
      </div>
    );
  }

  // ratingHistory: { '2025-08-12|11:04': 14.32, ... }
  const entries = selectedProfile && selectedProfile.ratingHistory
    ? Object.entries(selectedProfile.ratingHistory).sort((a, b) => a[0].localeCompare(b[0]))
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
    <div className="max-w-xl mx-auto mt-8 p-4">
      <h2 className="text-xl font-bold mb-4">레이팅 성장 그래프</h2>
      <button
        onClick={handleDebugClick}
        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        디버그 출력
      </button>
      {/* ratingHistory가 object일 때만 차트 렌더링 */}
      {selectedProfile && selectedProfile.ratingHistory && typeof selectedProfile.ratingHistory === 'object' ? (
        <>
          <Line data={data} options={options} />
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-muted-foreground">표시 구간 조절</label>
            <Slider min={5} max={100} step={1} value={[sliderValue]} onValueChange={v => setSliderValue(v[0])} />
            <div className="mt-2 text-xs text-muted-foreground">최근 {displayCount}개 데이터 표시</div>
          </div>
        </>
      ) : (
        <div className="mt-6 text-muted-foreground">선택한 프로필에 레이팅 히스토리 데이터가 없습니다.</div>
      )}
    </div>
  );
}
