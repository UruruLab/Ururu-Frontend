import React from 'react';
import { FormField } from '@/components/form/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FORM_STYLES } from '@/constants/form-styles';
import { formatPhoneNumber } from '@/lib/format-utils';
import { VALIDATION_CONSTANTS } from '@/constants/validation';
import { usePostcode } from '@/hooks/usePostcode';

interface AddressFormFieldsProps {
  addressData: {
    addressName: string;
    isDefault: boolean;
    phone: string;
    zonecode: string;
    address1: string;
    address2: string;
    addressDetail: string;
  };
  onInputChange: (field: string, value: string | boolean) => void;
  showDefaultCheckbox?: boolean;
}

export function AddressFormFields({
  addressData,
  onInputChange,
  showDefaultCheckbox = true,
}: AddressFormFieldsProps) {
  // 우편번호 검색 기능
  const handlePostcodeComplete = (data: any) => {
    onInputChange('zonecode', data.zonecode);
    onInputChange('address1', data.address);
  };

  const { openPostcode } = usePostcode({
    onComplete: handlePostcodeComplete,
  });

  return (
    <div className="space-y-6">
      {/* 배송지명 */}
      <FormField
        label="배송지명"
        required
        characterCount={{
          current: addressData.addressName.length,
          max: 20,
        }}
      >
        <Input
          type="text"
          placeholder="EX) 우리집"
          value={addressData.addressName}
          onChange={(e) => onInputChange('addressName', e.target.value)}
          maxLength={20}
          className={FORM_STYLES.input.base + ' ' + FORM_STYLES.input.focus}
          required
        />
      </FormField>

      {/* 기본 배송지 설정 */}
      {showDefaultCheckbox && (
        <div className="space-y-3">
          <label className={FORM_STYLES.checkbox.container}>
            <input
              type="checkbox"
              checked={addressData.isDefault}
              onChange={(e) => onInputChange('isDefault', e.target.checked)}
              className={FORM_STYLES.checkbox.base}
            />
            <span className={FORM_STYLES.checkbox.label}>기본 배송지로 설정</span>
          </label>
        </div>
      )}

      {/* 연락처 */}
      <FormField
        label="연락처"
        required
        helperText="하이픈(-)을 제외하고 숫자만 입력해주세요"
        characterCount={{
          current: addressData.phone.length,
          max: VALIDATION_CONSTANTS.PHONE.MAX_LENGTH,
        }}
      >
        <Input
          type="tel"
          placeholder="010-0000-0000"
          value={formatPhoneNumber(addressData.phone)}
          onChange={(e) => onInputChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
          maxLength={VALIDATION_CONSTANTS.PHONE.FORMATTED_MAX_LENGTH}
          className={FORM_STYLES.input.base + ' ' + FORM_STYLES.input.focus}
          required
        />
      </FormField>

      {/* 주소 */}
      <FormField label="주소" required>
        <div className="mb-2 flex gap-2">
          <Input
            type="text"
            placeholder="우편번호"
            value={addressData.zonecode}
            onChange={(e) => onInputChange('zonecode', e.target.value.replace(/[^0-9]/g, ''))}
            className={FORM_STYLES.input.base + ' flex-1'}
            maxLength={5}
            required
          />
          <button
            type="button"
            className={FORM_STYLES.button.pinkOutline + ' h-12 min-w-[120px] rounded-lg'}
            onClick={openPostcode}
          >
            우편 번호
          </button>
        </div>
        <Input
          type="text"
          placeholder="기본주소"
          value={addressData.address1}
          onChange={(e) => onInputChange('address1', e.target.value)}
          className={FORM_STYLES.input.base + ' mb-2'}
          maxLength={100}
          required
        />
        <Input
          type="text"
          placeholder="상세주소"
          value={addressData.address2}
          onChange={(e) => onInputChange('address2', e.target.value)}
          className={FORM_STYLES.input.base}
          maxLength={100}
          required
        />
      </FormField>

      {/* 상세주소 */}
      <FormField label="상세주소" required>
        <Input
          type="text"
          placeholder="상세주소를 입력해주세요"
          value={addressData.addressDetail}
          onChange={(e) => onInputChange('addressDetail', e.target.value)}
          className={FORM_STYLES.input.base + ' ' + FORM_STYLES.input.focus}
          maxLength={100}
          required
        />
      </FormField>
    </div>
  );
}
