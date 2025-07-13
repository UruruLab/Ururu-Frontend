'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddressFormFields } from '@/components/mypage/address/AddressFormFields';
import { addressListData, mockAddressData } from '@/data/address';
import { usePostcode } from '@/hooks/usePostcode';

interface DeliveryAddressProps {
  deliveryType: 'existing' | 'new';
  selectedAddressId: string;
  newAddressData: {
    addressName: string;
    isDefault: boolean;
    phone: string;
    zonecode: string;
    address1: string;
    address2: string;
    addressDetail: string;
  };
  onDeliveryTypeChange: (type: 'existing' | 'new') => void;
  onAddressIdChange: (id: string) => void;
  onNewAddressChange: (field: string, value: string | boolean) => void;
}

export function DeliveryAddress({
  deliveryType,
  selectedAddressId,
  newAddressData,
  onDeliveryTypeChange,
  onAddressIdChange,
  onNewAddressChange,
}: DeliveryAddressProps) {
  // 우편번호 검색 기능
  const handlePostcodeComplete = (data: any) => {
    onNewAddressChange('zonecode', data.zonecode);
    onNewAddressChange('address1', data.address);
  };

  const { openPostcode } = usePostcode({
    onComplete: handlePostcodeComplete,
  });

  return (
    <Card className="rounded-2xl border-0 bg-bg-100 shadow-none">
      <CardContent className="px-0 py-4 md:py-6">
        <h2 className="mb-6 text-lg font-semibold text-text-100">배송지 정보</h2>

        {/* 배송지 선택 */}
        <div className="mb-8">
          <h3 className="mb-4 text-base font-medium text-text-100">배송지 선택</h3>

          {/* 라디오 버튼으로 배송지 타입 선택 */}
          <div className="mb-6 flex space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="deliveryType"
                value="existing"
                checked={deliveryType === 'existing'}
                onChange={(e) => onDeliveryTypeChange(e.target.value as 'existing' | 'new')}
                className="custom-radio"
              />
              <span className="text-sm text-text-100">기존 배송지</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="deliveryType"
                value="new"
                checked={deliveryType === 'new'}
                onChange={(e) => onDeliveryTypeChange(e.target.value as 'existing' | 'new')}
                className="custom-radio"
              />
              <span className="text-sm text-text-100">신규 배송지</span>
            </label>
          </div>

          {/* 기존 배송지 드롭다운 */}
          {deliveryType === 'existing' && (
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-text-100">배송지 선택</label>
              <Select value={selectedAddressId} onValueChange={onAddressIdChange}>
                <SelectTrigger className="h-12 w-full rounded-lg border-bg-300 bg-bg-100 px-4 text-left text-sm text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300">
                  <SelectValue placeholder="배송지를 선택해주세요" />
                </SelectTrigger>
                <SelectContent className="z-[80] max-h-60 bg-bg-100">
                  {addressListData.map((address) => (
                    <SelectItem
                      key={address.id}
                      value={address.id.toString()}
                      className="cursor-pointer text-text-100 hover:bg-primary-100 hover:text-primary-300 focus:bg-primary-100 focus:text-primary-300"
                    >
                      {address.addressName}
                      {address.isDefault ? ' (기본)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 배송지 입력 폼 */}
          <AddressFormFields
            addressData={newAddressData}
            onInputChange={onNewAddressChange}
            showDefaultCheckbox={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
