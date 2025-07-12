import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { myPageData, beautyProfileData } from '@/data/mypage';
import { FORM_STYLES } from '@/constants/form-styles';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { UserInfo } from '@/types/auth';
import { SKIN_TYPE_OPTIONS, SKIN_TONE_OPTIONS } from '@/constants/beauty-profile';

interface ProfileCardProps {
  user: UserInfo | null;
}

export function ProfileCard({ user }: ProfileCardProps) {
  // API에서 받아온 값 사용
  const displayName = user?.member_name || user?.nickname || '이름없음';
  const displayAvatar = user?.profile_image || '/profile-image.svg';
  const userType = user?.user_type || 'MEMBER';
  const points = user?.points ?? 0;
  // 한글 변환
  const skinTypeLabel = SKIN_TYPE_OPTIONS.find((opt) => opt.value === user?.skin_type)?.label;
  const skinToneLabel = SKIN_TONE_OPTIONS.find((opt) => opt.value === user?.skin_tone)?.label;

  console.log('ProfileCard user:', user);
  console.log('skin_type:', user?.skin_type, 'skin_tone:', user?.skin_tone);
  console.log('skinTypeLabel:', skinTypeLabel, 'skinToneLabel:', skinToneLabel);

  return (
    <Card className="w-full rounded-2xl border-0 bg-bg-100 px-4 py-6 shadow-sm md:px-8">
      <CardContent className="p-0">
        <div className="mb-6 flex items-center justify-between">
          {/* 아바타/닉네임/뱃지 */}
          <div className="flex items-center gap-4 md:gap-6">
            <Avatar className="h-12 w-12 bg-bg-300 md:h-16 md:w-16">
              <AvatarImage src={displayAvatar || undefined} />
              <AvatarFallback>{displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="mb-1 text-lg font-semibold text-text-100 md:text-2xl">
                {displayName}
              </div>
              <div className="flex gap-1 md:gap-2">
                {/* skin_type, skin_tone 뱃지 */}
                {skinTypeLabel && (
                  <Badge className="rounded-full border border-primary-300 bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-300 md:px-3 md:py-1 md:text-xs">
                    {skinTypeLabel}
                  </Badge>
                )}
                {skinToneLabel && (
                  <Badge className="rounded-full border border-primary-300 bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-300 md:px-3 md:py-1 md:text-xs">
                    {skinToneLabel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {/* 포인트 */}
          <div className="flex flex-col items-center">
            <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full border border-primary-200 text-base font-bold text-primary-200 md:h-8 md:w-8 md:text-lg">
              P
            </span>
            <span className="text-xs text-text-300">우르르 포인트</span>
            <span className="text-base font-bold tracking-tight text-text-100 md:text-xl">
              {points.toLocaleString()}P
            </span>
          </div>
        </div>
        {/* 하단 버튼 */}
        <div className="flex w-full flex-col gap-2 md:flex-row md:gap-4">
          {/* 기존 버튼 렌더링 유지 */}
          {myPageData.profileActions.map((action) => (
            <Link
              key={action.label}
              href={action.href || '#'}
              className="flex-1"
              aria-label={`${action.label} 페이지로 이동`}
            >
              <Button variant="outline" className={cn(FORM_STYLES.button.profileCard)}>
                {action.label === '뷰티 프로필 수정' ? '뷰티 프로필 수정' : action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
