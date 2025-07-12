import React from 'react';
import { Sparkles, Heart, Palette } from 'lucide-react';

interface BeautyProfileSummaryProps {
  summaryInfo: {
    skinType: string;
    skinTone: string;
    skinConcerns: string[];
    interests: string[];
    skinReaction: string;
    priceRange: string;
  } | null;
}

export function BeautyProfileSummary({ summaryInfo }: BeautyProfileSummaryProps) {
  if (!summaryInfo) return null;

  return (
    <div className="rounded-xl border border-bg-300 bg-bg-100 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary-300" />
        <h2 className="text-lg font-semibold text-text-100">뷰티 프로필 요약</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 기본 정보 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-text-300" />
            <span className="text-sm font-medium text-text-200">기본 정보</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-text-300">피부 타입</span>
              <span className="text-sm font-medium text-text-100">
                {summaryInfo.skinType || '없음'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-300">피부 톤</span>
              <span className="text-sm font-medium text-text-100">
                {summaryInfo.skinTone || '없음'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-300">피부 고민</span>
              <span className="text-sm font-medium text-text-100">
                {summaryInfo.skinConcerns && summaryInfo.skinConcerns.length > 0
                  ? summaryInfo.skinConcerns.slice(0, 3).join(', ')
                  : '없음'}
              </span>
            </div>
          </div>
        </div>

        {/* 관심사 및 설정 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-text-300" />
            <span className="text-sm font-medium text-text-200">관심사 및 설정</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-text-300">관심 카테고리</span>
              <span className="text-sm font-medium text-text-100">
                {summaryInfo.interests && summaryInfo.interests.length > 0
                  ? (() => {
                      const displayInterests = summaryInfo.interests.slice(0, 2).join(', ');
                      return summaryInfo.interests.length > 2
                        ? `${displayInterests} 외`
                        : displayInterests;
                    })()
                  : '없음'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-300">선호 가격대</span>
              <span className="text-sm font-medium text-text-100">
                {summaryInfo.priceRange || '없음'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
