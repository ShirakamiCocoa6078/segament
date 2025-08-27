"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePrivacyPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => setSession(data));
  }, []);

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setProfiles(data.profiles || []);
      } catch (err) {
        setError("프로필 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    if (session && session.user && session.user.id) {
      fetchProfiles();
    }
  }, [session]);

  const handleToggle = (id: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, isPublic: !p.isPublic } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/account/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profiles: profiles.map(p => ({ id: p.id, isPublic: p.isPublic })) })
      });
      if (!res.ok) throw new Error("저장에 실패했습니다.");
      alert("공개여부가 저장되었습니다.");
    } catch (err) {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 비로그인 또는 다른 유저 접근 시 안내 및 버튼
  if (!session || !session.user) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 text-center">
        <div className="mb-4 text-lg">해당 페이지에 엑세스 권한이 없습니다. URL이 올바른지 다시 확인해주세요.</div>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={() => { window.location.href = '/'; }}
        >로그인</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-4">
      <h2 className="text-xl font-bold mb-4">프로필 공개여부 설정</h2>
      <Card className="p-4 mb-4">
        {loading ? (
          <div>프로필 정보를 불러오는 중...</div>
        ) : (
          <>
            {profiles.length === 0 ? (
              <div>등록된 프로필이 없습니다.</div>
            ) : (
              <ul className="space-y-4">
                {profiles.map(profile => (
                  <li key={profile.id} className="flex items-center justify-between">
                    <span>{profile.region ? `${profile.region} - ${profile.playerName}` : profile.playerName}</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!profile.isPublic}
                        onChange={() => handleToggle(profile.id)}
                      />
                      <span>{profile.isPublic ? "공개" : "비공개"}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <Button onClick={handleSave} disabled={saving || loading} className="w-full">
        {saving ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}
