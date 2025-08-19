import { useState, useEffect } from 'react';
import { getShippingAddresses } from '@/services/memberService';
import { ShippingAddress } from '@/types/api';

export function useAddressList() {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShippingAddresses();
      setAddresses(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage || '주소 목록을 불러오는데 실패했습니다.');
      // TODO: 에러 로깅 서비스 연동
      console.error('주소 목록 조회 실패:', err);
      setAddresses([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
  };
}
