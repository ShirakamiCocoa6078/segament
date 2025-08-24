// 파일 경로: src/components/dashboard/ProfileCard.tsx
import React from 'react';
import Link from 'next/link';
import type { ProfileSummary } from '@/types';
import { formatRating, createSlug } from '@/lib/utils';

interface AccessMode {
  mode: 'owner' | 'visitor' | 'private';
  canEdit: boolean;
  showPrivateData: boolean;
}

interface ProfileCardProps {
  profile: ProfileSummary;
  userId: string;
  accessMode: AccessMode;
}

export const ProfileCard = React.memo<ProfileCardProps>(({ profile, userId, accessMode }) => {
  const gameTypeSlug = createSlug(profile.gameType);
  const regionSlug = createSlug(profile.region);
  const detailUrl = `/${userId}/dashboard/detail/${gameTypeSlug}/${regionSlug}`;

  return (
    <Link 
      href={detailUrl} 
      className="block p-6 bg-white dark:bg-gray-900 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold dark:text-gray-100">{profile.gameType}</h2>
        {accessMode.mode === 'visitor' && (
          <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 dark:text-gray-100 px-2 py-1 rounded">
            공개
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">{profile.region}</p>
      <p className="text-lg dark:text-gray-100">{profile.playerName}</p>
      <p className="text-gray-600 dark:text-gray-200">Rating: {typeof profile.rating === 'number' ? profile.rating.toFixed(2) : 'N/A'}</p>
    </Link>
  );
});

ProfileCard.displayName = 'ProfileCard';
