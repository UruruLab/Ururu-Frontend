'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/form/FormField';
import { FORM_STYLES } from '@/constants/form-styles';
import Image from 'next/image';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ImageUploadField, DatePickerField, DiscountTierCard } from './common';
import { useImageValidation } from '@/hooks/seller/useImageValidation';
import { fetchGroupBuyCreateData, createGroupBuy } from '@/services/groupbuyService';
import type {
  GroupBuyProduct as ApiGroupBuyProduct,
  GroupBuyProductOption,
} from '@/types/groupbuy';
import { ErrorDialog } from '@/components/common/ErrorDialog';
import { SuccessDialog } from '@/components/common/SuccessDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Plus } from 'lucide-react';

interface DiscountTier {
  id: string;
  minParticipants: number;
  discountRate: number;
}

interface GroupBuyFormProduct {
  id: string;
  productId: string;
  selectedOptions: string[];
  maxQuantityPerPerson: number;
}

interface GroupBuyFormData {
  products: GroupBuyFormProduct[];
  title: string;
  description: string;
  mainImage: File | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
  detailImages: File[];
  discountTiers: DiscountTier[];
}

// OptionSelector: 공구 등록에서 옵션 선택만 하는 체크박스 UI
function OptionSelector({
  options,
  selectedOptions,
  onToggle,
  onOptionDataChange,
  optionData,
}: {
  options: GroupBuyProductOption[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
  onOptionDataChange: (optionId: number, field: 'stock' | 'priceOverride', value: number) => void;
  optionData: Record<number, { stock: number; priceOverride: number }>;
}) {
  return (
    <div className="space-y-4">
      {options.map((option, index) => {
        const isSelected = selectedOptions.includes(option.optionName);

        return (
          <Card
            key={`${option.optionId}-${option.optionName}-${index}`}
            className={`flex w-full cursor-pointer transition-all ${
              isSelected ? 'bg-primary-50 border-primary-300' : 'border-bg-300 bg-bg-100'
            }`}
            onClick={() => onToggle(option.optionName)}
          >
            <CardContent className="flex w-full gap-4 p-4">
              {/* 체크박스 */}
              <div className="flex items-start pt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(option.optionName)}
                  className={FORM_STYLES.checkbox.base}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* 옵션 이미지 */}
              <div className="relative h-[108px] w-[108px] flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={
                    option.optionUrl !== '/images/default-product-option.jpg'
                      ? option.optionUrl
                      : '/placeholder-product.jpg'
                  }
                  alt={option.optionName}
                  fill
                  className="object-cover"
                  sizes="108px"
                />
              </div>

              {/* 옵션 정보 */}
              <div className="flex flex-1 flex-col gap-2">
                {/* 옵션명 */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-text-100 md:text-base">
                    {option.optionName}
                  </span>
                </div>

                {/* 재고와 공동구매 시작가 입력 - 항상 표시하되 선택되지 않은 경우 비활성화 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs ${isSelected ? 'text-text-200' : 'text-text-300'}`}>
                      공동구매 시작가 *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={
                          optionData[option.optionId]?.priceOverride
                            ? optionData[option.optionId].priceOverride.toLocaleString()
                            : ''
                        }
                        className={`${FORM_STYLES.input.base} pr-8 ${!isSelected ? 'cursor-not-allowed bg-bg-200 text-text-300' : ''}`}
                        disabled={!isSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            // 숫자만 허용하고 앞의 0 제거
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            const numValue = value === '' ? 0 : parseInt(value, 10);
                            onOptionDataChange(option.optionId, 'priceOverride', numValue);
                          }
                        }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-300">
                        원
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs ${isSelected ? 'text-text-200' : 'text-text-300'}`}>
                      재고 *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={optionData[option.optionId]?.stock ?? ''}
                        className={`${FORM_STYLES.input.base} pr-8 ${!isSelected ? 'cursor-not-allowed bg-bg-200 text-text-300' : ''}`}
                        disabled={!isSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            // 숫자만 허용하고 앞의 0 제거
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            const numValue = value === '' ? 0 : parseInt(value, 10);
                            // 9,999,999 제한 적용
                            const limitedValue = Math.min(numValue, 9999999);
                            onOptionDataChange(option.optionId, 'stock', limitedValue);
                          }
                        }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-300">
                        개
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface GroupBuyFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    groupBuyId?: string;
    selectedProductId?: string;
    selectedOptions?: string[];
    optionData?: Record<number, { stock: number; priceOverride: number }>;
    maxQuantityPerPerson?: number;
    title?: string;
    description?: string;
    mainImage?: File | null;
    endDate?: Date;
    detailImages?: File[];
    discountTiers?: DiscountTier[];
  };
  onSubmit?: (data: any) => void;
}

export function GroupBuyForm({ mode, initialData, onSubmit }: GroupBuyFormProps) {
  const router = useRouter();

  // API 데이터 상태
  const [products, setProducts] = useState<ApiGroupBuyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleErrorDialogClose = () => setSubmitError(null);
  const handleSuccessDialogClose = () => {
    setSubmitSuccess(null);
    // 성공 모달창에서 확인 버튼을 누르면 공구 관리 페이지로 이동
    router.push('/seller/group-buys');
  };

  // 상품 1개만 선택
  const [selectedProductId, setSelectedProductId] = useState(initialData?.selectedProductId || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    initialData?.selectedOptions || [],
  );
  const [optionData, setOptionData] = useState<
    Record<number, { stock: number; priceOverride: number }>
  >(initialData?.optionData || {});
  const [maxQuantityPerPerson, setMaxQuantityPerPerson] = useState<number | null>(
    initialData?.maxQuantityPerPerson || null,
  );
  const [formData, setFormData] = useState<Omit<GroupBuyFormData, 'products' | 'discountTiers'>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    mainImage: initialData?.mainImage || null,
    startDate: undefined,
    endDate: initialData?.endDate || undefined,
    detailImages: initialData?.detailImages || [],
  });
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>(
    initialData?.discountTiers || [],
  );

  const selectedProduct = products.find((p) => p.productId.toString() === selectedProductId);
  const { validateImageFile, validateMultipleFiles } = useImageValidation();

  // API 데이터 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchGroupBuyCreateData();
        setProducts(response.data.products);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
        // 49 상품이 없다는 에러는 EmptyState로 처리
        if (
          errorMessage?.includes('공동구매 등록 가능한 상품 없습니다') ||
          errorMessage?.includes('상품이 없습니다') ||
          (err as any)?.status === 409
        ) {
          setProducts([]); // 빈 배열로 설정하여 EmptyState 표시
        } else {
          setError(errorMessage || '상품 데이터를 불러오지 못했습니다.');
        }
        // TODO: 에러 로깅 서비스 연동
        console.error('상품 데이터 로드 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  };

  const handleOptionDataChange = (
    optionId: number,
    field: 'stock' | 'priceOverride',
    value: number,
  ) => {
    setOptionData((prev) => ({
      ...prev,
      [optionId]: {
        ...prev[optionId],
        [field]: value,
      },
    }));
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      alert(error);
      e.target.value = '';
      return;
    }

    setFormData((prev) => ({ ...prev, mainImage: file }));
  };

  const handleDetailImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const { errors, validFiles } = validateMultipleFiles(files, formData.detailImages.length);

    if (errors.length > 0) {
      alert(errors.join('\n'));
      e.target.value = '';
      return;
    }

    setFormData((prev) => ({
      ...prev,
      detailImages: [...prev.detailImages, ...validFiles],
    }));
  };

  const removeDetailImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      detailImages: prev.detailImages.filter((_, i) => i !== index),
    }));
  };

  const reorderDetailImages = (fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const newImages = [...prev.detailImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return {
        ...prev,
        detailImages: newImages,
      };
    });
  };

  const addDiscountTier = () => {
    const newTier: DiscountTier = {
      id: Date.now().toString(),
      minParticipants: 0,
      discountRate: 0,
    };
    setDiscountTiers((prev) => [...prev, newTier]);
  };

  const removeDiscountTier = (tierId: string) => {
    setDiscountTiers((prev) => prev.filter((tier) => tier.id !== tierId));
  };

  const updateDiscountTier = (tierId: string, field: keyof DiscountTier, value: number) => {
    setDiscountTiers((prev) =>
      prev.map((tier) => (tier.id === tierId ? { ...tier, [field]: value } : tier)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 필수값 누락 체크 - 위에서부터 순서대로 첫 번째 누락된 필드만 표시
    if (!selectedProductId) {
      setSubmitError('상품을 선택해주세요.');
      return;
    }
    if (!formData.title) {
      setSubmitError('공구 제목을 입력해주세요.');
      return;
    }
    if (!formData.description) {
      setSubmitError('공구 설명을 입력해주세요.');
      return;
    }
    if (!formData.mainImage) {
      setSubmitError('대표 이미지를 업로드해주세요.');
      return;
    }
    if (!formData.endDate) {
      setSubmitError('종료일을 선택해주세요.');
      return;
    }
    if (selectedOptions.length === 0) {
      setSubmitError('상품 옵션을 선택해주세요.');
      return;
    }
    if (!maxQuantityPerPerson || maxQuantityPerPerson <= 0) {
      setSubmitError('1인당 최대 구매 수량을 입력해주세요.');
      return;
    }

    // 선택된 옵션의 재고/가격 입력 검증 - 위에서부터 순서대로
    for (const opt of selectedProduct?.options.filter((opt) =>
      selectedOptions.includes(opt.optionName),
    ) || []) {
      const optionDataState = optionData[opt.optionId];
      if (!optionDataState?.stock || optionDataState.stock <= 0) {
        setSubmitError(`${opt.optionName}의 재고를 입력해주세요.`);
        return;
      }
      if (!optionDataState?.priceOverride || optionDataState.priceOverride <= 0) {
        setSubmitError(`${opt.optionName}의 공동구매 시작가를 입력해주세요.`);
        return;
      }
    }

    // 실제 등록/수정 데이터 구조 예시
    const request = {
      title: formData.title,
      description: formData.description,
      endsAt: new Date(formData.endDate!.getTime() + 24 * 60 * 60 * 1000 - 1000).toISOString(),
      limitQuantityPerMember: maxQuantityPerPerson,
      productId: Number(selectedProductId),
      discountStages: discountTiers.map((tier) => ({
        count: tier.minParticipants,
        rate: tier.discountRate,
      })),
      options:
        selectedProduct?.options
          .filter((opt) => selectedOptions.includes(opt.optionName))
          .map((opt, idx) => ({
            id: idx,
            productOptionId: opt.optionId,
            priceOverride: optionData[opt.optionId]?.priceOverride ?? 0,
            stock: optionData[opt.optionId]?.stock ?? 0,
          })) || [],
    };
    const thumbnail = formData.mainImage;
    if (!thumbnail) {
      throw new Error('Main image is required');
    }
    const detailImages = formData.detailImages;

    if (onSubmit) {
      onSubmit({ request, thumbnail, detailImages });
    } else {
      setIsSubmitting(true);
      try {
        await createGroupBuy({ request, thumbnail, detailImages });
        setSubmitSuccess('공동구매가 성공적으로 등록되었습니다!');
        // TODO: 등록 후 이동 (예: 라우터 push)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
        setSubmitError(errorMessage || '공동구매 등록에 실패했습니다.');
        // TODO: 에러 로깅 서비스 연동
        console.error('공구 등록 실패:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRegisterProduct = () => {
    router.push('/seller/products/new');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
        <div className="text-center">상품 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 text-6xl">📦</div>
          <h2 className="mb-2 text-xl font-semibold text-text-100">
            상품 데이터를 불러오지 못했습니다
          </h2>
          <p className="text-text-200">{error}</p>
        </div>
      </div>
    );
  }

  // 상품이 없을 때 EmptyState 표시
  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
        {/* 타이틀 */}
        <h1 className="mb-10 text-center text-3xl font-semibold text-text-100">
          공구 {mode === 'create' ? '등록' : '수정'}
        </h1>

        {/* 알림 배너 */}
        <div className="mb-8 flex items-start gap-3 rounded-lg bg-bg-100 p-6 shadow-sm">
          <Image
            src="/ururu-gradient.svg"
            alt="우르르"
            width={24}
            height={24}
            className="h-6 w-6 flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-200">
              {mode === 'create'
                ? '새로운 상품을 등록하여 공동구매를 시작하세요!'
                : '공동구매 정보를 수정하세요!'}
            </p>
          </div>
        </div>

        {/* 상품 목록 섹션 */}
        <section>
          <SectionHeader title="등록된 상품" />
          <div className="mt-4">
            <div className="space-y-6">
              <EmptyState
                icon="📦"
                title="등록된 상품이 없습니다"
                description="첫 번째 상품을 등록해보세요"
              />
              <div className="text-center">
                <Button onClick={handleRegisterProduct} className={FORM_STYLES.button.submit}>
                  <Plus className="mr-2 h-4 w-4" />
                  상품 등록하기
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
      <ErrorDialog
        isOpen={!!submitError}
        onClose={handleErrorDialogClose}
        title="공구 등록 실패"
        message={submitError || ''}
      />
      <SuccessDialog
        isOpen={!!submitSuccess}
        onClose={handleSuccessDialogClose}
        title="공구 등록 성공"
        message={submitSuccess || ''}
      />
      {/* 타이틀 */}
      <h1 className="mb-10 text-center text-3xl font-semibold text-text-100">
        공구 {mode === 'create' ? '등록' : '수정'}
      </h1>

      {/* 알림 배너 */}
      <div className="mb-8 flex items-start gap-3 rounded-lg bg-bg-100 p-6 shadow-sm">
        <Image
          src="/ururu-gradient.svg"
          alt="우르르"
          width={24}
          height={24}
          className="h-6 w-6 flex-shrink-0"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-text-200">
            {mode === 'create'
              ? '새로운 상품을 등록하여 공동구매를 시작하세요!'
              : '공동구매 정보를 수정하세요!'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        {/* 상품 선택 */}
        <section>
          <SectionHeader title="상품 선택" description="공동구매를 진행할 상품을 선택해주세요" />
          <div className="mt-8 space-y-8">
            <FormField label="등록된 상품 선택" required>
              <Select
                value={selectedProductId}
                onValueChange={(value) => {
                  setSelectedProductId(value);
                  setSelectedOptions([]); // 상품 바뀌면 옵션 초기화
                }}
              >
                <SelectTrigger className="h-12 rounded-lg border-bg-300 bg-bg-100 px-4 text-left text-sm text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300">
                  <SelectValue placeholder="상품을 선택해주세요" />
                </SelectTrigger>
                <SelectContent className="z-[80] max-h-60 bg-bg-100">
                  {products.map((product) => (
                    <SelectItem
                      key={product.productId}
                      value={product.productId.toString()}
                      className="cursor-pointer text-text-100 hover:bg-primary-100 hover:text-primary-300 focus:bg-primary-100 focus:text-primary-300"
                    >
                      {product.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {selectedProduct && (
              <FormField label="상품 옵션 선택" required>
                <OptionSelector
                  options={selectedProduct.options}
                  selectedOptions={selectedOptions}
                  onToggle={handleOptionToggle}
                  onOptionDataChange={handleOptionDataChange}
                  optionData={optionData}
                />
              </FormField>
            )}

            <FormField
              label="1인당 최대 구매 수량"
              required
              helperText="최대 999개까지 설정 가능합니다"
            >
              <Input
                type="text"
                inputMode="numeric"
                value={maxQuantityPerPerson?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // 빈 값이면 null로 설정, 아니면 숫자로 변환
                  if (value === '') {
                    setMaxQuantityPerPerson(null);
                  } else {
                    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
                    // 999 제한 적용
                    if (!isNaN(numValue)) {
                      const limitedValue = Math.min(numValue, 999);
                      setMaxQuantityPerPerson(limitedValue);
                    } else {
                      setMaxQuantityPerPerson(null);
                    }
                  }
                }}
                placeholder="1"
                className={FORM_STYLES.input.base}
              />
            </FormField>
          </div>
        </section>

        {/* 공구 기본 정보 */}
        <section>
          <SectionHeader title="공구 기본 정보" description="공구의 기본 정보를 입력해주세요" />
          <div className="mt-8 space-y-6">
            <FormField
              label="공구 제목"
              required
              characterCount={{ current: formData.title.length, max: 100 }}
            >
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="EX) 수분 진정 토너 공동구매"
                className={FORM_STYLES.input.base}
                maxLength={100}
              />
            </FormField>

            <FormField
              label="공구 설명"
              required
              characterCount={{ current: formData.description.length, max: 1000 }}
            >
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="공구에 대한 상세한 설명을 입력해주세요"
                className={FORM_STYLES.textarea.base}
                rows={4}
                maxLength={1000}
              />
            </FormField>

            <ImageUploadField
              label="대표 이미지 업로드"
              required
              placeholder="대표 이미지를 업로드하세요"
              uploadedFiles={formData.mainImage ? [formData.mainImage] : []}
              onUpload={handleMainImageUpload}
              id="main-image-upload"
            />

            <DatePickerField
              label="종료일"
              required
              value={formData.endDate}
              onSelect={(date) => setFormData((prev) => ({ ...prev, endDate: date }))}
              placeholder="종료일 선택"
              disabled={(date) => date < new Date()}
            />
          </div>
        </section>

        {/* 상세 페이지 */}
        <section>
          <SectionHeader title="상세 페이지" description="상세 이미지를 등록해주세요" />
          <div className="mt-8">
            <ImageUploadField
              label="상세 이미지 업로드"
              multiple
              placeholder="상세 이미지를 업로드하세요"
              uploadedFiles={formData.detailImages}
              onUpload={handleDetailImageUpload}
              onRemove={removeDetailImage}
              onReorder={reorderDetailImages}
              id="detail-images-upload"
            />
          </div>
        </section>

        {/* 할인 단계 설정 */}
        <section>
          <SectionHeader
            title="할인 단계 설정"
            description="참여 인원에 따른 할인 단계를 설정해주세요 (최대 3개)"
          />
          <div className="mt-8 space-y-6">
            {discountTiers.map((tier, index) => (
              <DiscountTierCard
                key={tier.id}
                tier={tier}
                index={index}
                onRemove={removeDiscountTier}
                onUpdate={updateDiscountTier}
              />
            ))}
            <Button
              type="button"
              onClick={addDiscountTier}
              disabled={discountTiers.length >= 3}
              className={FORM_STYLES.button.pinkOutline + ' mt-2 h-12 w-full'}
            >
              할인 단계 추가하기
            </Button>
          </div>
        </section>

        {/* 등록/수정 버튼 */}
        <div className="pt-8">
          <Button
            type="submit"
            className="h-12 w-full rounded-lg bg-primary-300 text-sm font-medium text-text-on transition hover:opacity-80 focus:ring-primary-300 active:opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : mode === 'create' ? '등록하기' : '수정하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// 기존 등록 페이지용 래퍼 컴포넌트
export function GroupBuyRegistration() {
  return <GroupBuyForm mode="create" />;
}
