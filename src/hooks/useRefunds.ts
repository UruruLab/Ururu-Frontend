import { useState, useEffect, useCallback } from 'react';
import { getRefunds } from '@/services/refundService';
import { convertRefund } from '@/lib/utils';
import { Refund, RefundStatusSummary, RefundStatusFilter, ApiRefund } from '@/types/refund';

export function useRefunds(statusFilter: RefundStatusFilter = 'all') {
  const [allRefunds, setAllRefunds] = useState<ApiRefund[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [summary, setSummary] = useState<RefundStatusSummary>({
    approved: 0,
    completed: 0,
    rejected: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

        status: statusFilter,
        page: 1,
        size: 5,
      };

      const data = await getRefunds(apiParams);
      setAllRefunds(data.refunds);
      const convertedRefunds = data.refunds.map(convertRefund);
      setRefunds(convertedRefunds);

      // 개수는 더 이상 사용하지 않음 (필터 탭에서 숨김)
      setSummary({ approved: 0, completed: 0, rejected: 0, failed: 0 });

      setPage(2);
      setHasMore(data.refunds.length === 5);
    } catch (err) {
      console.error('환불 내역 조회 실패:', err);
      setError(`에러: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // 추가 데이터 로드 (무한 스크롤)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    try {
      setLoadingMore(true);

      // 클라이언트 필터를 API 형식으로 변환 (이제 직접 매핑)
      const data = await getRefunds({
        page,
        size: 5,
      });
        size: 5,
      });

      // 데이터가 없거나 5개 미만이면 더 이상 없음
      if (data.refunds.length === 0) {
        setHasMore(false);
        return;
      }

      if (data.refunds.length < 5) {
        setHasMore(false);
      }

      // 기존 데이터에 새 데이터 추가 (함수형 업데이트)
      setAllRefunds((prev) => {
        const newAllRefunds = [...prev, ...data.refunds];
        // 변환하여 UI 데이터 업데이트
        const newConvertedRefunds = newAllRefunds.map(convertRefund);
        setRefunds(newConvertedRefunds);

        // 개수는 더 이상 사용하지 않음 (필터 탭에서 숨김)
        setSummary({ approved: 0, completed: 0, rejected: 0, failed: 0 });

        return newAllRefunds;
      });

      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('추가 데이터 로드 실패:', err);
      // 에러 발생시 더 이상 로드하지 않음
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, statusFilter]);

  // statusFilter가 변경되면 데이터 다시 로드
  useEffect(() => {
    setAllRefunds([]);
    setRefunds([]);
    setPage(1);
    setHasMore(true);
    loadInitialData();
  }, [loadInitialData]);

  return {
    refunds,
    summary,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  };
}
