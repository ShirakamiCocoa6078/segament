"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileDisplay } from "@/components/dashboard/profile-display";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Line } from "react-chartjs-2";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

export default function ChunithmRatingHistoryPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [profile, setProfile] = useState<any>(null);
    // 디버그 버튼 클릭 핸들러
    const handleDebugClick = () => {
      console.log('profile:', profile);
      console.log('ratingHistory:', profile.ratingHistory);
      console.log('displayEntries:', displayEntries);
      console.log('chart data:', data);
    };
  const [sliderValue, setSliderValue] = useState<number>(100);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch(`/api/profile/public/${userId}`);
      const data = await res.json();
      setProfile(data.profile);
    }
  if (userId) { fetchProfile(); }
  }, [userId]);

  if (!profile || !profile.ratingHistory) {
    return (
      <Card className="max-w-xl mx-auto mt-8 p-6 text-center">
        <h2 className="text-xl font-bold mb-2">레이팅 성장 그래프</h2>
        <p className="text-muted-foreground">해당 프로필에 레이팅 히스토리 데이터가 없습니다.</p>
      </Card>
    );
  }

  // ratingHistory: { '2025-08-12|11:04': 14.32, ... }
  const entries = Object.entries(profile.ratingHistory).sort((a, b) => a[0].localeCompare(b[0]));
  const total = entries.length;
  const displayCount = Math.max(5, Math.floor((sliderValue / 100) * total));
  const displayEntries = entries.slice(total - displayCount);

  // 디버깅: 데이터 구조 확인 (useEffect로 브라우저 콘솔에 출력)
  React.useEffect(() => {
    console.log('ratingHistory:', profile.ratingHistory);
    console.log('displayEntries:', displayEntries);
    console.log('chart data:', data);
  }, [profile.ratingHistory, displayEntries]);
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
      <Line data={data} options={options} />
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-muted-foreground">표시 구간 조절</label>
        <Slider min={5} max={100} step={1} value={[sliderValue]} onValueChange={v => setSliderValue(v[0])} />
        <div className="mt-2 text-xs text-muted-foreground">최근 {displayCount}개 데이터 표시</div>
      </div>
    </div>
  );
}
