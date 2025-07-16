'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ScrollToTopButton, ErrorDialog, ConfirmDialog } from '@/components/common';
import { FORM_STYLES } from '@/constants/form-styles';
import {
  getSellerGroupBuys,
  getAllSellerGroupBuys,
  deleteGroupBuy,
  updateGroupBuyStatus,
} from '@/services/groupbuyService';
import type { SellerGroupBuy, SellerGroupBuyListResponse } from '@/types/groupbuy';
import { Plus, Play, Pause } from 'lucide-react';
import { Pagination } from '@/components/seller/common/Pagination';

export function GroupBuyManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBuyData, setGroupBuyData] = useState<SellerGroupBuyListResponse | null>(null);
  const [allGroupBuys, setAllGroupBuys] = useState<SellerGroupBuy[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    groupBuyId: number | null;
    groupBuyTitle: string;
  }>({
    isOpen: false,
    groupBuyId: null,
    groupBuyTitle: '',
  });
  const [deleteError, setDeleteError] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  // 그룹바이 목록 조회
  const fetchGroupBuys = async (page: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSellerGroupBuys(page, pageSize);
      setGroupBuyData(data);
      setAllGroupBuys(data.data.content || []);
    } catch (err: any) {
      setError(err.message || '그룹바이 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupBuys(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchGroupBuys(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRegisterGroupBuy = () => {
    router.push('/seller/group-buys/new');
  };

  const handleViewGroupBuy = (groupBuyId: number) => {
    router.push(`/groupbuys/${groupBuyId}`);
  };

  const handleEditGroupBuy = (groupBuyId: number) => {
    router.push(`/seller/group-buys/${groupBuyId}/edit`);
  };

  const handleDeleteClick = (groupBuyId: number, groupBuyTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      groupBuyId,
      groupBuyTitle,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.groupBuyId) return;
    const groupBuyTitle = deleteConfirm.groupBuyTitle;

    try {
      // 실제 삭제 API 호출
      await deleteGroupBuy(deleteConfirm.groupBuyId);

      // 삭제 후 목록 새로고침
      await fetchGroupBuys(currentPage);
      setDeleteConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
    } catch (error: any) {
      console.error('Delete failed:', error);
      setDeleteError({
        isOpen: true,
        message: `"${groupBuyTitle}" ${error.message || '그룹바이 삭제에 실패했습니다.'}`,
      });
      setDeleteConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
  };

  const handleStatusChange = async (groupBuyId: number, currentStatus: string) => {
    try {
      let newStatus: 'OPEN' | 'CLOSED' | 'ACTIVE';

      if (currentStatus === 'CLOSED') {
        newStatus = 'OPEN';
      } else {
        newStatus = 'CLOSED';
      }

      await updateGroupBuyStatus(groupBuyId, newStatus);
      await fetchGroupBuys(currentPage);
    } catch (error: any) {
      console.error('Status change failed:', error);
      setError('상태 변경에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-300">
            진행중
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center rounded-lg bg-bg-200 px-3 py-1.5 text-xs font-medium text-text-200">
            마감됨
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-600">
            완료됨
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 카테고리와 태그는 현재 API에서 제공되지 않으므로 제거

  const groupBuys = groupBuyData?.data?.content || [];
  const totalElements = groupBuyData?.data?.totalElements || 0;
  const totalPages = groupBuyData?.data?.totalPages || 0;
  const isFirst = groupBuyData?.data?.first || true;
  const isLast = groupBuyData?.data?.last || true;

  // 전체 데이터에서 카운트 계산
  const openCount = allGroupBuys.filter((g) => g.status === 'OPEN').length;
  const closedCount = allGroupBuys.filter((g) => g.status === 'CLOSED').length;
  const completedCount = allGroupBuys.filter((g) => g.status === 'COMPLETED').length;
  const totalCount = allGroupBuys.length;

  if (error) {
    return <div className="py-20 text-center text-red-500">서버 오류가 발생했습니다.</div>;
  }
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
        <h1 className="mb-10 text-center text-3xl font-semibold text-text-100">그룹바이 관리</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-24 w-full" />
          ))}
        </div>
        <ScrollToTopButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
      {/* 타이틀 */}
      <h1 className="mb-10 text-center text-3xl font-semibold text-text-100">그룹바이 관리</h1>

      {/* 상단 카운트 4개 */}
      <div className="mx-auto mb-10 flex w-full max-w-lg justify-center">
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl font-bold text-text-100 md:text-4xl">{totalCount}</span>
          <span className="mt-1 text-center text-sm font-medium text-text-200 md:text-lg">
            전체
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl font-bold text-text-100 md:text-4xl">{openCount}</span>
          <span className="mt-1 text-center text-sm font-medium text-text-200 md:text-lg">
            진행중
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl font-bold text-text-100 md:text-4xl">{closedCount}</span>
          <span className="mt-1 text-center text-sm font-medium text-text-200 md:text-lg">
            마감됨
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl font-bold text-text-100 md:text-4xl">{completedCount}</span>
          <span className="mt-1 text-center text-sm font-medium text-text-200 md:text-lg">
            완료됨
          </span>
        </div>
      </div>

      {/* 그룹바이 목록 섹션 */}
      <section>
        <SectionHeader title="등록된 그룹바이" />
        <div className="mt-4">
          {groupBuys.length === 0 ? (
            <div className="space-y-6">
              <EmptyState
                icon="🤝"
                title="등록된 그룹바이가 없습니다"
                description="첫 번째 그룹바이를 등록해보세요"
              />
              <div className="text-center">
                <Button onClick={handleRegisterGroupBuy} className={FORM_STYLES.button.submit}>
                  <Plus className="mr-2 h-4 w-4" />
                  그룹바이 등록하기
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="space-y-4"
              style={{
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {groupBuys.map((groupBuy) => (
                <Card key={groupBuy.id} className={FORM_STYLES.card.seller}>
                  <CardContent className="relative p-6">
                    {/* 상태 뱃지: 우측 상단 고정 */}
                    <div className="absolute right-6 top-6 z-10">
                      {getStatusBadge(groupBuy.status)}
                    </div>
                    {/* 제목, 가격 정보 */}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-text-100">{groupBuy.title}</h2>
                      <div className="mt-2 space-y-1 text-sm text-text-300">
                        <div>시작가: {groupBuy.startPrice.toLocaleString()}원</div>
                        <div>최종가: {groupBuy.displayFinalPrice.toLocaleString()}원</div>
                        <div>최대 할인율: {groupBuy.maxDiscountRate}%</div>
                        <div>
                          주문 수: {groupBuy.orderCount}개 | 재고:{' '}
                          {groupBuy.totalStock - groupBuy.soldQuantity}개
                        </div>
                        <div>
                          시작일: {formatDate(groupBuy.startAt)} | 마감일:{' '}
                          {formatDate(groupBuy.endsAt)}
                        </div>
                      </div>
                    </div>
                    {/* 하단: 버튼 4개(좌) */}
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => handleViewGroupBuy(groupBuy.id)}
                        className="h-10 rounded-lg border border-primary-300 bg-bg-100 px-6 text-sm text-primary-300 shadow-none transition-colors hover:bg-primary-100 active:bg-primary-100 active:text-primary-300"
                      >
                        상세보기
                      </Button>
                      <Button
                        onClick={() => handleEditGroupBuy(groupBuy.id)}
                        className="h-10 rounded-lg border border-primary-300 bg-bg-100 px-6 text-sm text-primary-300 shadow-none transition-colors hover:bg-primary-100 active:bg-primary-100 active:text-primary-300"
                      >
                        수정하기
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(groupBuy.id, groupBuy.status)}
                        className="h-10 rounded-lg border border-primary-300 bg-bg-100 px-6 text-sm text-primary-300 shadow-none transition-colors hover:bg-primary-100 active:bg-primary-100 active:text-primary-300"
                      >
                        {groupBuy.status === 'CLOSED' ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            시작하기
                          </>
                        ) : (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            마감하기
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(groupBuy.id, groupBuy.title)}
                        className="h-10 rounded-lg border border-bg-300 bg-bg-100 px-6 text-sm text-text-300 shadow-none transition-colors hover:border-primary-200 hover:text-primary-200"
                      >
                        삭제하기
                      </Button>
                    </div>
                    {/* 등록일/수정일: 오른쪽 하단, 글자 크기 text-sm */}
                    <div className="absolute bottom-6 right-6 whitespace-nowrap text-sm text-text-300">
                      등록일: {formatDate(groupBuy.createdAt)} 수정일:{' '}
                      {formatDate(groupBuy.updatedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 페이지네이션: 그룹바이 관리 페이지 하단 */}
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* ScrollToTopButton - 일관된 스크롤 동작 */}
      <ScrollToTopButton />

      {/* 삭제 확인 모달창 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="그룹바이 삭제 확인"
        message={`"${deleteConfirm.groupBuyTitle}"\n\n그룹바이를 삭제하시겠습니까? 삭제하면 복구가 불가능합니다.`}
        confirmText="삭제하기"
        cancelText="취소"
        variant="danger"
      />

      {/* 삭제 에러 모달창 */}
      <ErrorDialog
        isOpen={deleteError.isOpen}
        onClose={() => setDeleteError({ isOpen: false, message: '' })}
        title="그룹바이 삭제 실패"
        message={deleteError.message}
      />
    </div>
  );
}
