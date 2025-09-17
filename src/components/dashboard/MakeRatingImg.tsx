import React from "react";

export interface RatingSong {
  id: string;
  title: string;
  level: string;
  jacketUrl: string;
  constant: number;
  ratingValue: number;
  score: number;
  difficulty: string;
  rank: number;
}

export interface RatingProfile {
  nickname: string;
  rating: number;
  level: number;
  playCount: number;
}

export interface MakeRatingImgProps {
  profile: RatingProfile;
  best30: RatingSong[];
  new20: RatingSong[];
  best30Avg: number;
  new20Avg: number;
}

const MakeRatingImg: React.FC<MakeRatingImgProps> = ({ profile, best30, new20, best30Avg, new20Avg }) => {
  return (
    <div style={{ width: 1200, padding: 32, background: '#fff', fontFamily: 'sans-serif' }}>
      {/* 프로필 카드 */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ fontSize: 32, fontWeight: 'bold' }}>{profile.nickname}</div>
        <div style={{ fontSize: 24 }}>레이팅: {profile.rating}</div>
        <div style={{ fontSize: 24 }}>레벨: {profile.level}</div>
        <div style={{ fontSize: 24 }}>플레이카운트: {profile.playCount}</div>
      </div>
      {/* Best30 카드 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>Best 30 (평균: {best30Avg.toFixed(2)})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {best30.map(song => (
            <div key={song.id + song.difficulty} style={{ width: 180, border: '1px solid #ccc', borderRadius: 8, padding: 8, background: '#f9f9f9' }}>
              <img src={song.jacketUrl} alt={song.title} style={{ width: '100%', borderRadius: 4 }} />
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{song.title}</div>
              <div>레벨: {song.level}</div>
              <div>상수: {song.constant}</div>
              <div>레이팅: {song.ratingValue}</div>
              <div>스코어: {song.score}</div>
              <div>난이도: {song.difficulty}</div>
              <div>순위: {song.rank}</div>
            </div>
          ))}
        </div>
      </div>
      {/* New20 카드 */}
      <div>
        <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>New 20 (평균: {new20Avg.toFixed(2)})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {new20.map(song => (
            <div key={song.id + song.difficulty} style={{ width: 180, border: '1px solid #ccc', borderRadius: 8, padding: 8, background: '#f9f9f9' }}>
              <img src={song.jacketUrl} alt={song.title} style={{ width: '100%', borderRadius: 4 }} />
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{song.title}</div>
              <div>레벨: {song.level}</div>
              <div>상수: {song.constant}</div>
              <div>레이팅: {song.ratingValue}</div>
              <div>스코어: {song.score}</div>
              <div>난이도: {song.difficulty}</div>
              <div>순위: {song.rank}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MakeRatingImg;
