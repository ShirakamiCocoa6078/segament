'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function PlayerCard() {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // API를 호출하여 생성된 프로필 이미지 URL들을 가져옵니다.
        fetch('/api/generate-profile-images')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to generate profile images.');
                }
                return res.json();
            })
            .then(data => {
                if (data.imageUrls && data.imageUrls.length > 0) {
                    setImageUrls(data.imageUrls);
                } else {
                    throw new Error('No image URLs returned.');
                }
            })
            .catch(error => {
                console.error("Error fetching profile images:", error);
                // 에러 발생 시 이미지 URL 배열을 비워 에러 메시지가 표시되도록 합니다.
                setImageUrls([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        // 이미지 URL이 2개 이상일 때만 3초마다 이미지를 순환시킵니다.
        if (imageUrls.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % imageUrls.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [imageUrls]);

    if (isLoading) {
        // API로부터 응답을 기다리는 동안 스켈레톤 UI를 표시합니다.
        // w-full max-w-[911px]는 1823px 너비를 반응형으로 조정한 예시입니다.
        return <Skeleton className="w-full max-w-[911px] mx-auto aspect-[1823/722] rounded-lg" />;
    }

    if (imageUrls.length === 0) {
        return (
            <div className="w-full max-w-[911px] mx-auto aspect-[1823/722] rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">프로필 이미지를 생성할 수 없습니다. 데이터를 다시 임포트해주세요.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-[911px] mx-auto">
            <img 
                src={imageUrls[currentImageIndex]} 
                alt="Player Profile Card" 
                className="w-full h-auto rounded-lg"
            />
            <Button 
                onClick={() => window.open(imageUrls[currentImageIndex], '_blank')} 
                className="absolute bottom-4 right-4"
            >
                이미지 다운로드
            </Button>
        </div>
    );
}