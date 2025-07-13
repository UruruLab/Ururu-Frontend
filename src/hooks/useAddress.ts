import { useState, useEffect, useCallback } from 'react';
import { useSafeSearchParams, useSafeRouter } from '@/hooks';
import { mockAddressData, AddressData } from '@/data/address';

export const useAddress = () => {
  const router = useSafeRouter();
  const searchParams = useSafeSearchParams();
  const addressId = searchParams.get('id');
  const isEditMode = Boolean(addressId);

  const [addressData, setAddressData] = useState<Omit<AddressData, 'id'>>({
    addressName: '',
    isDefault: false,
    phone: '',
    zonecode: '',
    address1: '',
    address2: '',
    addressDetail: '',
  });

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEditMode && addressId && mockAddressData[Number(addressId)]) {
      const existingData = mockAddressData[Number(addressId)];
      const { id, ...dataWithoutId } = existingData;
      setAddressData(dataWithoutId);
    }
  }, [isEditMode, addressId]);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // TODO: 실제 배송지 저장 API 연동 필요
      // TODO: 실제 배송지 저장 API 호출
      // 저장 후 배송지 관리 페이지로 이동
      router.push('/mypage/address');
    },
    [addressData, router],
  );

  const resetForm = useCallback(() => {
    setAddressData({
      addressName: '',
      isDefault: false,
      phone: '',
      zonecode: '',
      address1: '',
      address2: '',
      addressDetail: '',
    });
  }, []);

  return {
    addressData,
    isEditMode,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
