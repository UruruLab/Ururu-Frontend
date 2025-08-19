import { useState, useEffect, useCallback } from 'react';
import { useSafeSearchParams, useSafeRouter } from '@/hooks';
import { mockAddressData, AddressData } from '@/data/address';
import {
  postShippingAddress,
  getShippingAddressById,
  putShippingAddress,
} from '@/services/memberService';

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
  });

  // 에러 다이얼로그 상태
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [errorDialogDetails, setErrorDialogDetails] = useState('');

  // 수정 모드일 때 기존 데이터 API로 로드
  useEffect(() => {
    const fetchAddress = async () => {
      if (isEditMode && addressId) {
        try {
          const data = await getShippingAddressById(Number(addressId));
          setAddressData({
            addressName: data.label,
            isDefault: data.is_default,
            phone: data.phone,
            zonecode: data.zonecode,
            address1: data.address1,
            address2: data.address2,
          });
        } catch (err: any) {
          setErrorDialogTitle('배송지 조회 실패');
          setErrorDialogMessage('배송지 정보를 불러오지 못했습니다.');
          setErrorDialogDetails(err?.message || '');
          setIsErrorDialogOpen(true);
        }
      }
    };
    fetchAddress();
  }, [isEditMode, addressId]);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (isEditMode && addressId) {
          await putShippingAddress(Number(addressId), {
            label: addressData.addressName,
            phone: addressData.phone,
            zonecode: addressData.zonecode,
            address1: addressData.address1,
            address2: addressData.address2,
            isDefault: addressData.isDefault,
          });
        } else {
          await postShippingAddress({
            label: addressData.addressName,
            phone: addressData.phone,
            zonecode: addressData.zonecode,
            address1: addressData.address1,
            address2: addressData.address2,
            isDefault: addressData.isDefault,
          });
        }
        router.replace('/mypage/address');
      } catch (err: any) {
        setErrorDialogTitle(isEditMode ? '배송지 수정 실패' : '배송지 등록 실패');
        setErrorDialogMessage(
          err?.response?.data?.message || err?.message || '알 수 없는 오류가 발생했습니다.',
        );
        setErrorDialogDetails(err?.response?.data?.errorDetails || '');
        setIsErrorDialogOpen(true);
        console.error(isEditMode ? '배송지 수정 오류:' : '배송지 등록 오류:', err);
      }
    },
    [addressData, router, isEditMode, addressId],
  );

  const resetForm = useCallback(() => {
    setAddressData({
      addressName: '',
      isDefault: false,
      phone: '',
      zonecode: '',
      address1: '',
      address2: '',
    });
  }, []);

  const onCloseErrorDialog = useCallback(() => {
    setIsErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('');
    setErrorDialogDetails('');
  }, []);

  return {
    addressData,
    isEditMode,
    handleInputChange,
    handleSubmit,
    resetForm,
    isErrorDialogOpen,
    errorDialogTitle,
    errorDialogMessage,
    errorDialogDetails,
    onCloseErrorDialog,
  };
};
