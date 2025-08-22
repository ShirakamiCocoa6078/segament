// 파일 경로: src/app/[userId]/dashboard/detail/chunithm/playPercent/page.tsx

"use client";
// 곡별 OP 계산 함수
interface OpForSongParams {
  score: number;
  rating: number;
  constant: number;
  comboType: number;
}
function opForSong({ score, rating, constant, comboType }: OpForSongParams) {
  // comboType: 0=none, 1=FC, 2=AJ, 3=AJC
  let bonus1 = 0;
  if (comboType === 1) bonus1 = 0.5;
  else if (comboType === 2) bonus1 = 1.0;
  else if (comboType === 3) bonus1 = 1.25;

  let op = 0;
  if (score >= 1010000) {
    op = (constant + 3) * 5;
  } else if (score >= 1007501) {
    const bonus2 = (score - 1007500) * 0.0015;
    op = (constant + 2) * 5 + bonus1 + bonus2;
  } else if (score >= 975000) {
    op = (parseFloat(rating?.toFixed(2)) * 5) + bonus1;
  } else {
    op = 0;
  }
  return parseFloat(op.toFixed(4));
}

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChunithmProfile {
  id: string;
  playerName: string;
  region: string;
  rating?: number;
  level?: number;
}

interface PlayPercentData {
  totalSongs?: number;
  playedSongs?: number;
  playPercentage?: number;
  difficultyBreakdown?: {
    [key: string]: {
      total?: number;
      played?: number;
      percentage?: number;
    };
  };
}

interface AccessMode {
  mode: 'owner' | 'visitor';
  canEdit: boolean;
  showPrivateData: boolean;
}

export default function ChunithmPlayPercentPage() {
  // 실제 데이터 연동 예시 (샘플 구조)
  // songData, categoryData, playData 등 실제 데이터로 대체 필요
  // 곡 목록, 플레이 기록, 장르/레벨/버전/난이도 정보 등
  // 아래는 구조 예시
  const songData: any[] = [];
  const categoryData: any[] = [];
  const playlogs: any[] = [];
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }
  }
  function calcMaxOpForSong(song: any): number {
    // 최고점수 기준 OP (AJC)
    return (song.const + 3) * 5;
  }

  // 4. 그룹별 집계
  function getGroupStats(groups: Record<string, any[]>, playlogs: any[]): any[] {
    return Object.entries(groups).map(([group, songs]) => {
      let maxOp = 0, currentOp = 0, ajc = 0, aj = 0, fc = 0;
      songs.forEach(song => {
        maxOp += calcMaxOpForSong(song);
        const log = playlogs.find(l => l.id === song.id && l.difficulty === song.difficulty);
        const op = calcOpForSong(song, log);
        currentOp += op;
        // 카운트 예시 (실제 조건에 맞게 수정)
        if (log?.isAllJusticeCritical) ajc++;
        else if (log?.isAllJustice) aj++;
        else if (log?.isFullCombo) fc++;
      });
      const percent = maxOp > 0 ? (currentOp / maxOp) * 100 : 0;
      return {
        group,
        maxOp,
        currentOp,
        percent,
        ajc,
        aj,
        fc
      };
    });
  }

  // 5. 전체 집계
  function getTotalStats(groupStats: any[]): any {
    let maxOp = 0, currentOp = 0, ajc = 0, aj = 0, fc = 0;
    groupStats.forEach(stat => {
      maxOp += stat.maxOp;
      currentOp += stat.currentOp;
      ajc += stat.ajc;
      aj += stat.aj;
      fc += stat.fc;
    });
    const percent = maxOp > 0 ? (currentOp / maxOp) * 100 : 0;
    return { maxOp, currentOp, percent, ajc, aj, fc };
  }

  // 6. 필터/집계/렌더링 샘플
  // 실제 데이터 연동 시, songData/playlogs/categoryData 등 활용
  // 변수 선언 위치 조정 (useState 이후)
  const filteredSongs = filterSongsByTarget(songData, difficultyType);
  const groupedSongs = groupSongs(filteredSongs, filterType);
  const groupStats = getGroupStats(groupedSongs, playlogs);
  const totalStats = getTotalStats(groupStats);
  // 기준 선택 상태
  const [filterType, setFilterType] = useState<'genre'|'level'|'const'|'version'>('genre');
  const [filterValue, setFilterValue] = useState<string>('ALL');
  const [difficultyType, setDifficultyType] = useState<'poje'|'all'|'basic'|'advanced'|'expert'|'master'|'ultima'>('poje');

  // 샘플 데이터: 실제 데이터 로딩/필터링 로직은 playData, songData, categoryData 등 활용 필요
  const genreOptions = ['ALL','POPS&ANIME','niconico','東方Project','VARIETY','イロドリミドリ','ゲキマイ','ORIGINAL','ULTIMA'];
  const levelOptions = ['1','2','3','4','5','6','7','8','9','10','10+','11','11+','12','12+','13','13+','14','14+','15','15+'];
  const constOptions = ['5','14.5','14.6','14.7','14.8','14.9','15.0','15.1','15.2','15.3','15.4'];
  const versionOptions = ['ver1','ver2','ver3']; // 실제 버전 목록 category-data.json에서 추출 필요

  // breakdown 샘플 데이터
  const breakdownList = [
    { type: 'AJ', label: 'ALL JUSTICE', count: 20, total: 100, percent: 20.0 },
    { type: 'FC', label: 'FULL COMBO', count: 50, total: 100, percent: 50.0 },
    { type: 'OTHER', label: 'OTHER', count: 30, total: 100, percent: 30.0 },
  ];

  function getPercentColor(percent: number) {
    if (percent >= 95) return 'linear-gradient(90deg, #ffb6f7, #b6eaff, #fff7b6)'; // 무지개
    if (percent >= 90) return '#e5e4e2'; // 플래티넘
    if (percent >= 80) return '#ffd700'; // 금색
    if (percent >= 70) return '#c0c0c0'; // 은색
    return '#fff'; // 흰색
  }
  const [profiles, setProfiles] = useState<ChunithmProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ChunithmProfile | null>(null);
  const [playData, setPlayData] = useState<PlayPercentData | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isLoadingPlayData, setIsLoadingPlayData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode>({ mode: 'visitor', canEdit: false, showPrivateData: false });
  
  const params = useParams();
  const { userId } = params;
  const { data: session } = useSession();

  // 프로필 목록 가져오기
  useEffect(() => {
    const fetchProfiles = async () => {
      if (typeof userId !== 'string') return;
      if (session === undefined) return;
      try {
        const isOwner = session?.user?.id === userId;
        setAccessMode({
          mode: isOwner ? 'owner' : 'visitor',
          canEdit: isOwner,
          showPrivateData: isOwner
        });

        const endpoint = isOwner 
          ? '/api/dashboard'
          : `/api/profile/public/${userId}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('프로필이 비공개로 설정되어 있습니다.');
          } else if (response.status === 404) {
            throw new Error('사용자를 찾을 수 없습니다.');
          } else {
            throw new Error('프로필 정보를 불러오는데 실패했습니다.');
          }
        }
        const data = await response.json();
        const chunithmProfiles = (data?.profiles || [])
          .filter((profile: any) => profile?.gameType === 'CHUNITHM')
          .map((profile: any) => ({
            id: profile?.id || '',
            playerName: profile?.playerName || 'Unknown Player',
            region: profile?.region || 'Unknown Region',
            rating: typeof profile?.rating === 'number' ? profile.rating : undefined,
            level: typeof profile?.level === 'number' ? profile.level : undefined,
          }));
        setProfiles(chunithmProfiles);
        if (chunithmProfiles.length > 0) {
          setSelectedProfile(chunithmProfiles[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    fetchProfiles();
  }, [userId]);

  // 선택된 프로필에 따른 플레이 데이터 가져오기
  useEffect(() => {
    const fetchPlayData = async () => {
      if (!selectedProfile) return;
      setIsLoadingPlayData(true);
      try {
        const isOwner = session?.user?.id === userId;
        const endpoint = isOwner 
          ? `/api/dashboard/play-percent?gameType=CHUNITHM&region=${selectedProfile.region}`
          : `/api/profile/play-percent/${userId}?gameType=CHUNITHM&region=${selectedProfile.region}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('프로필이 비공개로 설정되어 있습니다.');
          } else if (response.status === 404) {
            throw new Error('플레이 데이터를 찾을 수 없습니다.');
          } else {
            throw new Error('플레이 데이터를 불러오는데 실패했습니다.');
          }
        }
        const data = await response.json();
        const safePlayData: PlayPercentData = {
          totalSongs: typeof data?.playData?.totalSongs === 'number' ? data.playData.totalSongs : 0,
          playedSongs: typeof data?.playData?.playedSongs === 'number' ? data.playData.playedSongs : 0,
          playPercentage: typeof data?.playData?.playPercentage === 'number' ? data.playData.playPercentage : 0,
          difficultyBreakdown: {},
        };
        if (data?.playData?.difficultyBreakdown && typeof data.playData.difficultyBreakdown === 'object') {
          Object.entries(data.playData.difficultyBreakdown).forEach(([difficulty, diffData]: [string, any]) => {
            if (diffData && typeof diffData === 'object') {
              if (!safePlayData.difficultyBreakdown) {
                safePlayData.difficultyBreakdown = {};
              }
              safePlayData.difficultyBreakdown[difficulty] = {
                played: typeof diffData.played === 'number' ? diffData.played : 0,
                total: typeof diffData.total === 'number' ? diffData.total : 0,
                percentage: typeof diffData.percentage === 'number' ? diffData.percentage : 0,
              };
            }
          });
        }
        setPlayData(safePlayData);
      } catch (err) {
        console.error('플레이 데이터 로딩 에러:', err);
        setPlayData(null);
      } finally {
        setIsLoadingPlayData(false);
      }
    };
    fetchPlayData();
  }, [selectedProfile]);

  const handleProfileChange = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
    }
  };

  if (isLoadingProfiles) {
    return <div className="p-4 text-center">프로필을 불러오는 중...</div>;
  }
  
  if (error) {
    return (
      {/* 종합 현황 표시 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>종합 진행도</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">달성 OP</span>
              <span className="text-2xl text-blue-600">{totalStats.currentOp?.toFixed(4) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">최대 OP</span>
              <span className="text-2xl text-purple-600">{totalStats.maxOp?.toFixed(4) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">달성률</span>
              <span className="text-2xl" style={{ color: getPercentColor(totalStats.percent) }}>{totalStats.percent?.toFixed(2) ?? '-'}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">AJC</span>
              <span className="text-2xl text-yellow-500">{totalStats.ajc ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">AJ</span>
              <span className="text-2xl text-yellow-400">{totalStats.aj ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">FC</span>
              <span className="text-2xl text-green-500">{totalStats.fc ?? '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 그룹별 breakdown 표시 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{filterType === 'genre' ? '장르별' : filterType === 'level' ? '레벨별' : filterType === 'const' ? '상수별' : '버전별'} 진행도</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupStats.map(item => (
              <div key={item.group} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex flex-col items-start w-32">
                  <span className="font-bold text-xs">{item.group}</span>
                  <span className="text-xs">{item.currentOp?.toFixed(4) ?? '-'} / {item.maxOp?.toFixed(4) ?? '-'} ({item.percent?.toFixed(2) ?? '-'}%)</span>
                  <span className="text-xs">AJC {item.ajc} / AJ {item.aj} / FC {item.fc}</span>
                </div>
                <div className="container mx-auto p-4">
                  {/* ...기존 상단 UI... */}
                  <div className="mb-6 flex items-center justify-between">
                    <Link href={`/${userId}/dashboard`}>
                      <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {accessMode.mode === 'owner' ? '내 대시보드' : '프로필로 돌아가기'}
                      </Button>
                    </Link>
                    {accessMode.mode === 'visitor' && (
                      <div className="text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded">
                        공개 프로필 보기
                      </div>
                    )}
                  </div>
                  {/* Card 컴포넌트들을 부모 div로 래핑 */}
                  <div>
                    {/* 기준 선택 섹션 */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>기준 선택</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 items-center">
                          <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="genre">장르</SelectItem>
                              <SelectItem value="level">레벨</SelectItem>
                              <SelectItem value="const">상수</SelectItem>
                              <SelectItem value="version">버전</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={filterValue} onValueChange={v => setFilterValue(v)}>
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(filterType === 'genre' ? genreOptions :
                                filterType === 'level' ? levelOptions :
                                filterType === 'const' ? constOptions :
                                versionOptions
                              ).map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={difficultyType} onValueChange={v => setDifficultyType(v as any)}>
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="poje">포제</SelectItem>
                              <SelectItem value="all">전난이도</SelectItem>
                              <SelectItem value="basic">베이직</SelectItem>
                              <SelectItem value="advanced">어드밴스드</SelectItem>
                              <SelectItem value="expert">엑스퍼트</SelectItem>
                              <SelectItem value="master">마스터</SelectItem>
                              <SelectItem value="ultima">울티마</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                    {/* 선택된 프로필 정보 표시 */}
                    {selectedProfile && (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>선택된 프로필</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{selectedProfile.playerName}</p>
                              <p className="text-sm text-muted-foreground">플레이어 닉네임</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{selectedProfile.region}</p>
                              <p className="text-sm text-muted-foreground">지역</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">
                                {typeof selectedProfile.rating === 'number' ? selectedProfile.rating.toFixed(2) : '0.00'}
                              </p>
                              <p className="text-sm text-muted-foreground">레이팅</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {/* 종합 현황 표시 */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>종합 진행도</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">달성 OP</span>
                            <span className="text-2xl text-blue-600">{totalStats.currentOp?.toFixed(4) ?? '-'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">최대 OP</span>
                            <span className="text-2xl text-purple-600">{totalStats.maxOp?.toFixed(4) ?? '-'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">달성률</span>
                            <span className="text-2xl" style={{ color: getPercentColor(totalStats.percent) }}>{totalStats.percent?.toFixed(2) ?? '-'}%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">AJC</span>
                            <span className="text-2xl text-yellow-500">{totalStats.ajc ?? '-'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">AJ</span>
                            <span className="text-2xl text-yellow-400">{totalStats.aj ?? '-'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">FC</span>
                            <span className="text-2xl text-green-500">{totalStats.fc ?? '-'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {/* 그룹별 breakdown 표시 */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>{filterType === 'genre' ? '장르별' : filterType === 'level' ? '레벨별' : filterType === 'const' ? '상수별' : '버전별'} 진행도</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {groupStats.map(item => (
                            <div key={item.group} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex flex-col items-start w-32">
                                <span className="font-bold text-xs">{item.group}</span>
                                <span className="text-xs">{item.currentOp?.toFixed(4) ?? '-'} / {item.maxOp?.toFixed(4) ?? '-'} ({item.percent?.toFixed(2) ?? '-'}%)</span>
                                <span className="text-xs">AJC {item.ajc} / AJ {item.aj} / FC {item.fc}</span>
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-4 rounded-full"
                                    style={{ width: `${item.percent}%`, background: getPercentColor(item.percent) }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    {/* breakdown 표시 샘플 */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>상세 breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {breakdownList.map(item => (
                            <div key={item.type} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex flex-col items-start w-32">
                                <span className="font-bold text-xs">{item.label}</span>
                                <span className="text-xs">{item.count} / {item.total} ({item.percent.toFixed(1)}%)</span>
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-4 rounded-full"
                                    style={{ width: `${item.percent}%`, background: getPercentColor(item.percent) }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* ...기존 코드... */}
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}