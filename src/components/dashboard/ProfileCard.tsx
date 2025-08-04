// 파일 경로: src/components/dashboard/ProfileCard.tsx
import React from 'react';
import Link from 'next/link';
import type { ProfileSummary } from '@/types';
import { formatRating, createSlug } from '@/lib/utils';

interface ProfileCardProps {
  profile: ProfileSummary;
}

export const ProfileCard = React.memo<ProfileCardProps>(({ profile }) => {
  const gameTypeSlug = createSlug(profile.gameType);
  const regionSlug = createSlug(profile.region);
  const detailUrl = `/dashboard/detail/${gameTypeSlug}/${regionSlug}`;

  return (
    <Link 
      href={detailUrl} 
      className="block p-6 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
    >
      <h2 className="text-xl font-semibold">{profile.gameType}</h2>
      <p className="text-sm text-gray-500 mb-2">{profile.region}</p>
      <p className="text-lg">{profile.playerName}</p>
      <p className="text-gray-600">Rating: {formatRating(profile.rating)}</p>
    </Link>
  );
});

ProfileCard.displayName = 'ProfileCard';
