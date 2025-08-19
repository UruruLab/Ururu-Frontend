'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MyPageLayout } from '@/components/mypage/MyPageLayout';
import { AddressCard } from '@/components/mypage/address/AddressCard';
import { NoticeBanner, PageHeader, ErrorDialog } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddressList } from '@/hooks/useAddressList';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { deleteShippingAddress } from '@/services/memberService';
import { FORM_STYLES } from '@/constants/form-styles';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// 주소 카드 스켈레톤 컴포넌트
function AddressCardSkeleton() {
  return (
    <div className="rounded-lg p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

function AddressPageContent() {
  const { addresses, loading: isLoading, error, refetch } = useAddressList();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteShippingAddress(deleteTargetId);
      setIsDeleteDialogOpen(false);
      setDeleteTargetId(null);
      setDeleteError(null);
      await refetch();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || err?.message || '삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setDeleteError(null);
  };

  if (isLoading) {
    return (
      <MyPageLayout>
        <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
          <PageHeader title="배송지 관리" />
          <NoticeBanner message="배송지는 최대 5개까지 등록할 수 있어요" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <AddressCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </MyPageLayout>
    );
  }

  if (error) {
    return (
      <MyPageLayout>
        <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
          <PageHeader title="배송지 관리" />
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-text-300">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              다시 시도
            </Button>
          </div>
        </div>
      </MyPageLayout>
    );
  }

  return (
    <MyPageLayout>
      <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
        {/* 페이지 헤더 */}
        <PageHeader title="배송지 관리" />

        {/* 안내 배너 */}
        <NoticeBanner message="배송지는 최대 5개까지 등록할 수 있어요" />

        {/* 배송지 리스트 */}
        <div className="flex flex-col gap-4">
          {!addresses || !Array.isArray(addresses) || addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-center text-text-300">등록된 배송지가 없습니다.</p>
            </div>
          ) : (
            [...addresses]
              .sort((a, b) => Number(b.is_default) - Number(a.is_default))
              .map((address) => (
                <AddressCard key={address.id} address={address} onDelete={handleDeleteClick} />
              ))
          )}
        </div>

        {/* 배송지 추가 버튼 */}
        <div className="mb-4">
          <Button
            onClick={() => router.push('/mypage/address/register')}
            variant="outline"
            className={cn(FORM_STYLES.button.addressAdd)}
          >
            배송지 추가하기
          </Button>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>배송지 삭제</DialogTitle>
          </DialogHeader>
          {deleteError ? (
            <div className="mb-4 text-sm text-red-500">{deleteError}</div>
          ) : (
            <div className="mb-4 text-text-200">정말 이 배송지를 삭제하시겠습니까?</div>
          )}
          <DialogFooter>
            <Button onClick={handleDeleteDialogClose} variant="outline">
              취소
            </Button>
            <Button onClick={handleDeleteConfirm} disabled={isDeleting}>
              삭제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MyPageLayout>
  );
}

export default function AddressPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AddressPageContent />
    </AuthGuard>
  );
}
