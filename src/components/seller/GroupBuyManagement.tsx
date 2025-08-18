'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollToTopButton, ErrorDialog, ConfirmDialog } from '@/components/common';
import { FORM_STYLES } from '@/constants/form-styles';
import {
  getSellerGroupBuys,
  getAllSellerGroupBuys,
  deleteGroupBuy,
  updateGroupBuyStatus,
} from '@/services/groupbuyService';
import type { SellerGroupBuy, SellerGroupBuyListResponse } from '@/types/groupbuy';
import { Plus } from 'lucide-react';
import { Pagination } from '@/components/seller/common/Pagination';
import { Badge } from '@/components/ui/badge';

export function GroupBuyManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
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
  const [startConfirm, setStartConfirm] = useState<{
    isOpen: boolean;
    groupBuyId: number | null;
    groupBuyTitle: string;
  }>({
    isOpen: false,
    groupBuyId: null,
    groupBuyTitle: '',
  });

  // 그룹바이 목록 조회
  const fetchGroupBuys = async (page: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSellerGroupBuys(page, pageSize);
      setGroupBuyData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알수 없는 오류가 발생했습니다';
      setError(errorMessage || '공구 목록을 불러오는데 실패했습니다.');
      // TODO: 에러 로깅 서비스 연동
      console.error('공구 목록 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 전체 그룹바이 목록 조회 (카운트용)
  const fetchAllGroupBuys = async () => {
    setIsLoadingCounts(true);
    try {
      const data = await getAllSellerGroupBuys();
      setAllGroupBuys(data.data.content || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알수 없는 오류가 발생했습니다';
      console.error('전체공구 목록 조회 실패:', err);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  useEffect(() => {
    fetchGroupBuys(currentPage);
    fetchAllGroupBuys();
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
      await fetchAllGroupBuys(); // 전체 카운트도 새로고침
      setDeleteConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알수 없는 오류가 발생했습니다';
      console.error('공구 삭제 실패:', err);
      setDeleteError({
        isOpen: true,
        message: `"${groupBuyTitle}" ${errorMessage || '그룹바이 삭제에 실패했습니다.'}`,
      });
      setDeleteConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
  };

  const handleStartClick = (groupBuyId: number, groupBuyTitle: string) => {
    setStartConfirm({
      isOpen: true,
      groupBuyId,
      groupBuyTitle,
    });
  };

  const handleStartConfirm = async () => {
    if (!startConfirm.groupBuyId) return;

    try {
      await updateGroupBuyStatus(startConfirm.groupBuyId, 'OPEN');
      await fetchGroupBuys(currentPage);
      await fetchAllGroupBuys(); // 전체 카운트도 새로고침
      setStartConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알수 없는 오류가 발생했습니다';
      console.error('공구 시작 실패:', err);
      setError(errorMessage || '공구 시작에 실패했습니다.');
      setStartConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
    }
  };

  const handleStartCancel = () => {
    setStartConfirm({ isOpen: false, groupBuyId: null, groupBuyTitle: '' });
  };

  // 상태 뱃지 렌더링 함수
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-300">
            진행중
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center rounded-lg border border-primary-300 bg-transparent px-3 py-1.5 text-xs font-medium text-primary-300">
            대기중
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center rounded-lg border border-bg-300 bg-bg-200 px-3 py-1.5 text-xs font-medium text-text-200">
            마감됨
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

  // 최신순으로 정렬 (updatedAt 기준)
  const sortedGroupBuys = [...groupBuys].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // 전체 데이터에서 카운트 계산
  const openCount = allGroupBuys.filter((g) => g.status === 'OPEN').length;
  const draftCount = allGroupBuys.filter((g) => g.status === 'DRAFT').length;
  const closedCount = allGroupBuys.filter((g) => g.status === 'CLOSED').length;
  const totalCount = allGroupBuys.length;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
        <h1 className="mb-10 text-center text-3xl font-semibold text-text-100">공구 관리</h1>
        <div className="space-y-6">
          <EmptyState
            icon="🤝"
            title="등록된 공구가 없습니다"
            description="첫 번째 공구를 등록해보세요"
          />
          <div className="text-center">
            <Button onClick={handleRegisterGroupBuy} className={FORM_STYLES.button.submit}>
              <Plus className="mr-2 h-4 w-4" />
              공구 등록하기
            </Button>
          </div>
        </div>
        <ScrollToTopButton />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
        <h1 className="mb-10 text-center text-3xl font-semibold text-text-100">공구 관리</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
        <ScrollToTopButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
      {/* 타이틀 */}
      <h1 className="mb-10 text-center text-3xl font-semibold text-text-100">공구 관리</h1>

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
            공구 진행중
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl font-bold text-text-100 md:text-4xl">{draftCount}</span>
          <span className="mt-1 text-center text-sm font-medium text-text-200 md:text-lg">
            공구 대기
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl font-bold text-text-100 md:text-4xl">{closedCount}</span>
          <span className="mt-1 text-center text-sm font-medium text-text-200 md:text-lg">
            공구 마감
          </span>
        </div>
      </div>

      {/* 공구 목록 섹션 */}
      <section>
        <SectionHeader title="등록된 공구" />
        <div className="mt-4">
          {groupBuys.length === 0 ? (
            <div className="space-y-6">
              <EmptyState
                icon="🤝"
                title="등록된 공구가 없습니다"
                description="첫 번째 공구를 등록해보세요"
              />
              <div className="text-center">
                <Button onClick={handleRegisterGroupBuy} className={FORM_STYLES.button.submit}>
                  <Plus className="mr-2 h-4 w-4" />
                  공구 등록하기
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
              {sortedGroupBuys.map((groupBuy) => (
                <Card key={groupBuy.id} className={FORM_STYLES.card.seller}>
                  <CardContent className="relative p-6">
                    {/* 상태 뱃지: 우측 상단 고정 */}
                    <div className="absolute right-6 top-6 z-10">
                      {renderStatusBadge(groupBuy.status)}
                    </div>
                    {/* 제목 */}
                    <h2 className="mb-4 text-lg font-semibold text-text-100">{groupBuy.title}</h2>

                    {/* 썸네일과 정보를 가로로 배치 */}
                    <div className="flex gap-4">
                      {/* 썸네일 이미지 */}
                      <div className="flex-shrink-0">
                        <img
                          src={groupBuy.thumbnailUrl}
                          alt={groupBuy.title}
                          className="rounded-lg object-cover"
                          style={{ width: '120px', height: '120px' }}
                        />
                      </div>

                      {/* 가격 정보 */}
                      <div className="flex-1 space-y-1 text-sm text-text-300">
                        <div>시작가: {groupBuy.startPrice.toLocaleString()}원</div>
                        <div>최대 할인 적용가: {groupBuy.displayFinalPrice.toLocaleString()}원</div>
                        <div>최대 할인율: {groupBuy.maxDiscountRate}%</div>
                        <div>
                          주문 수: {groupBuy.orderCount}개 | 재고:{' '}
                          {groupBuy.totalStock - groupBuy.soldQuantity}개
                        </div>
                        <div>
                          {groupBuy.startAt && `시작일: ${formatDate(groupBuy.startAt)} | `}마감일:{' '}
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
                      {groupBuy.status === 'DRAFT' && (
                        <Button
                          onClick={() => handleEditGroupBuy(groupBuy.id)}
                          className="h-10 rounded-lg border border-primary-300 bg-bg-100 px-6 text-sm text-primary-300 shadow-none transition-colors hover:bg-primary-100 active:bg-primary-100 active:text-primary-300"
                        >
                          수정하기
                        </Button>
                      )}
                      {groupBuy.status === 'DRAFT' && (
                        <Button
                          onClick={() => handleStartClick(groupBuy.id, groupBuy.title)}
                          className="h-10 rounded-lg border border-primary-300 bg-bg-100 px-6 text-sm text-primary-300 shadow-none transition-colors hover:bg-primary-100 active:bg-primary-100 active:text-primary-300"
                        >
                          공구시작
                        </Button>
                      )}
                      {groupBuy.status !== 'OPEN' && (
                        <Button
                          onClick={() => handleDeleteClick(groupBuy.id, groupBuy.title)}
                          className="h-10 rounded-lg border border-bg-300 bg-bg-100 px-6 text-sm text-text-300 shadow-none transition-colors hover:border-primary-200 hover:text-primary-200"
                        >
                          삭제하기
                        </Button>
                      )}
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

      {/* 페이지네이션: 공구 관리 페이지 하단 */}
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
        title="공구 삭제 확인"
        message={`"${deleteConfirm.groupBuyTitle}"\n\n공구를 삭제하시겠습니까? 삭제하면 복구가 불가능합니다.`}
        confirmText="삭제하기"
        cancelText="취소"
        variant="danger"
      />

      {/* 삭제 에러 모달창 */}
      <ErrorDialog
        isOpen={deleteError.isOpen}
        onClose={() => setDeleteError({ isOpen: false, message: '' })}
        title="공구 삭제 실패"
        message={deleteError.message}
      />

      {/* 공구 시작 확인 모달창 */}
      <ConfirmDialog
        isOpen={startConfirm.isOpen}
        onClose={handleStartCancel}
        onConfirm={handleStartConfirm}
        title="공구 시작 확인"
        message={`"${startConfirm.groupBuyTitle}"\n\n공동구매를 시작하시겠습니까? 시작 후 수정이 불가합니다.`}
        confirmText="시작하기"
        cancelText="취소"
        variant="default"
      />
    </div>
  );
}
