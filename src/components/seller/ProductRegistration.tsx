'use client';

import { useState } from 'react';
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
import { FormField } from '@/components/form/FormField';
import { FORM_STYLES } from '@/constants/form-styles';
import { PRODUCT_CATEGORY_DATA, CAPACITY_UNITS } from '@/data/seller';
import { useFormArray } from '@/hooks/seller/useFormArray';
import { OptionList } from './common/OptionList';
import { SectionHeader } from '@/components/common/SectionHeader';
import type {
  Category,
  Tag,
  CreateProductRequest,
  ProductFormData,
  ProductEditOption,
  ProductRegistrationProps,
} from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductService } from '@/services/productService';
import { SuccessDialog } from '@/components/common/SuccessDialog';
import { ErrorDialog } from '@/components/common/ErrorDialog';
import { validateProductForm } from '@/lib/product/validation';

export function ProductRegistration({ categories, tags }: ProductRegistrationProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    categoryMain: '',
    categoryMiddle: '',
    categorySub: '',
    options: [],
    capacity: '',
    capacityUnit: 'ml',
    specification: '',
    expiryDate: '',
    usage: '',
    manufacturer: '',
    seller: '',
    country: '',
    functionalTest: 'no',
    precautions: '',
    qualityStandard: '',
    customerService: '',
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 옵션 관리 로직을 useFormArray로 대체
  const optionArray = useFormArray<ProductEditOption>(formData.options);

  // 기존 addOption, removeOption, updateOption, handleImageUpload 대체
  const handleOptionChange = (id: string, field: keyof ProductEditOption, value: any) => {
    // id가 "new-{index}" 형태인지 확인
    const newOptionMatch = id.match(/^new-(\d+)$/);
    if (newOptionMatch) {
      // 새 옵션인 경우 인덱스로 찾기
      const index = parseInt(newOptionMatch[1], 10);
      const currentItems = optionArray.items;
      const updatedItems = currentItems.map((opt, idx) =>
        idx === index ? { ...opt, [field]: value } : opt,
      );
      optionArray.set(updatedItems);
    } else {
      // 기존 옵션인 경우 id로 찾기
      optionArray.update(
        (opt) => String(opt.id) === id,
        (opt) => ({ ...opt, [field]: value }),
      );
    }
  };
  const handleOptionRemove = (id: string) => {
    // id가 "new-{index}" 형태인지 확인
    const newOptionMatch = id.match(/^new-(\d+)$/);
    if (newOptionMatch) {
      // 새 옵션인 경우 인덱스로 찾기
      const index = parseInt(newOptionMatch[1], 10);
      const currentItems = optionArray.items;
      const updatedItems = currentItems.filter((_, idx) => idx !== index);
      optionArray.set(updatedItems);
    } else {
      // 기존 옵션인 경우 id로 찾기
      optionArray.remove((opt) => String(opt.id) === id);
    }
  };
  const handleOptionImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleOptionChange(id, 'image', file);
  };
  const handleAddOption = () => {
    optionArray.add({
      id: null,
      name: '',
      price: 0,
      image: null,
      fullIngredients: '',
    });
  };

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const handleSuccessDialogClose = () => {
    setSubmitSuccess(false);
    router.push('/seller/products');
  };
  const handleErrorDialogClose = () => setSubmitError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const validationError = validateProductForm(formData, optionArray, selectedTags);
      if (validationError) {
        setSubmitError(validationError);
        setSubmitLoading(false);
        return;
      }
      // 카테고리 ID 배열 생성 (예시: 마지막 선택된 카테고리까지)
      const categoryIds: number[] = [];
      const findCategoryId = (label: string, cats: Category[]): number | null => {
        for (const cat of cats) {
          if (cat.label === label) return cat.value;
          if (cat.children) {
            const found = findCategoryId(label, cat.children);
            if (found) return found;
          }
        }
        return null;
      };
      if (formData.categoryMain) {
        const id = findCategoryId(formData.categoryMain, categories);
        if (id) categoryIds.push(id);
      }
      if (formData.categoryMiddle) {
        const main = categories.find((c) => c.label === formData.categoryMain);
        if (main && main.children) {
          const id = findCategoryId(formData.categoryMiddle, main.children);
          if (id) categoryIds.push(id);
        }
      }
      if (formData.categorySub) {
        const main = categories.find((c) => c.label === formData.categoryMain);
        const middle = main?.children?.find((c) => c.label === formData.categoryMiddle);
        if (middle && middle.children) {
          const id = findCategoryId(formData.categorySub, middle.children);
          if (id) categoryIds.push(id);
        }
      }
      // 태그 ID 배열
      const tagCategoryIds = selectedTags.map((tag) => tag.value);
      // 옵션
      const productOptions = optionArray.items.map((opt) => ({
        name: opt.name,
        price: opt.price,
        fullIngredients: opt.fullIngredients,
      }));
      // 옵션 이미지
      const optionImages = optionArray.items
        .map((opt) => opt.image)
        .filter((img): img is File => !!img);
      // 상품 공시
      const productNotice = {
        capacity: formData.capacity + (formData.capacityUnit ? formData.capacityUnit : ''),
        spec: formData.specification,
        expiry: formData.expiryDate,
        usage: formData.usage,
        manufacturer: formData.manufacturer,
        responsibleSeller: formData.seller,
        countryOfOrigin: formData.country,
        functionalCosmetics: formData.functionalTest === 'yes' ? true : false,
        caution: formData.precautions,
        warranty: formData.qualityStandard,
        customerServiceNumber: formData.customerService,
      };
      const product: CreateProductRequest = {
        name: formData.name,
        description: formData.description,
        categoryIds,
        tagCategoryIds,
        productOptions,
        productNotice,
      };
      await ProductService.createProduct(product, optionImages);
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message || '상품 등록에 실패했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 카테고리/태그 로딩/에러 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 변경 핸들러
  const handleCategoryMainChange = (value: string) => {
    handleInputChange('categoryMain', value);
    handleInputChange('categoryMiddle', '');
    handleInputChange('categorySub', '');
  };

  const handleCategoryMiddleChange = (value: string) => {
    handleInputChange('categoryMiddle', value);
    handleInputChange('categorySub', '');
  };

  const handleCategorySubChange = (value: string) => {
    handleInputChange('categorySub', value);
  };

  // 카테고리 제거 핸들러
  const handleRemoveCategory = (type: 'main' | 'middle' | 'sub') => {
    if (type === 'main') {
      handleInputChange('categoryMain', '');
      handleInputChange('categoryMiddle', '');
      handleInputChange('categorySub', '');
    } else if (type === 'middle') {
      handleInputChange('categoryMiddle', '');
      handleInputChange('categorySub', '');
    } else if (type === 'sub') {
      handleInputChange('categorySub', '');
    }
  };

  // 태그 변경 핸들러
  const handleTagsChange = (newTags: Tag[]) => {
    setSelectedTags(newTags);
  };

  // API 데이터에서 카테고리 가져오기
  const getMainCategories = () => {
    return categories.map((cat: Category) => cat.label);
  };

  const getMiddleCategories = () => {
    if (!formData.categoryMain) return [];
    const mainCategory = categories.find((cat: Category) => cat.label === formData.categoryMain);
    return mainCategory?.children?.map((cat: Category) => cat.label) || [];
  };

  const getSubCategories = () => {
    if (!formData.categoryMiddle) return [];
    const mainCategory = categories.find((cat: Category) => cat.label === formData.categoryMain);
    const middleCategory = mainCategory?.children?.find(
      (cat: Category) => cat.label === formData.categoryMiddle,
    );
    return middleCategory?.children?.map((cat: Category) => cat.label) || [];
  };

  // 태그 비동기 로딩/에러/선택 상태 관리
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    setTagLoading(true);
    setTagError(null);
    // 비동기 태그 데이터 로딩 (실제 API 연동 시 ProductService.getProductMetadata() 등 사용)
    Promise.resolve(tags)
      .then((data) => setTagList(data))
      .catch((e) => setTagError('태그를 불러오지 못했습니다.'))
      .finally(() => setTagLoading(false));
  }, [tags]);

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags((prev) => {
      if (prev.find((t) => t.value === tag.value)) {
        return prev.filter((t) => t.value !== tag.value);
      }
      if (prev.length >= 3) return prev;
      return [...prev, tag];
    });
  };
  const handleTagRemove = (tag: Tag) => {
    setSelectedTags((prev) => prev.filter((t) => t.value !== tag.value));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
      {/* 타이틀 */}
      <h1 className="mb-10 text-center text-3xl font-semibold text-text-100">상품 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-16">
        {/* 상품 기본 정보 */}
        <section>
          <SectionHeader
            title="상품 기본 정보"
            description="판매할 상품의 기본 정보를 입력해주세요"
          />

          <div className="mt-8 space-y-6">
            <FormField label="상품명" required>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="EX) 컬러그램 누디 블러 틴트 20 COLOR"
                className={FORM_STYLES.input.base}
              />
            </FormField>

            <FormField
              label="상품 설명"
              required
              characterCount={{ current: formData.description.length, max: 200 }}
            >
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="EX) 한 번에 터치하고 입술 보정 필터"
                className={FORM_STYLES.textarea.base}
                rows={2}
                maxLength={200}
              />
            </FormField>

            {/* 카테고리 */}
            <FormField label="카테고리" required>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : error ? (
                <div className="text-sm text-red-500">카테고리 정보를 불러오지 못했습니다.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Select value={formData.categoryMain} onValueChange={handleCategoryMainChange}>
                      <SelectTrigger className="h-12 w-1/3 rounded-lg border-bg-300 bg-bg-100 px-4 text-left text-sm text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300">
                        <SelectValue placeholder="대분류" />
                      </SelectTrigger>
                      <SelectContent className="z-[80] max-h-60 overflow-auto scroll-smooth bg-bg-100">
                        {getMainCategories().map((category: string) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="cursor-pointer text-text-100 hover:bg-primary-100 hover:text-primary-300 focus:bg-primary-100 focus:text-primary-300"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={formData.categoryMiddle}
                      onValueChange={handleCategoryMiddleChange}
                      disabled={!formData.categoryMain || getMiddleCategories().length === 0}
                    >
                      <SelectTrigger className="h-12 w-1/3 rounded-lg border-bg-300 bg-bg-100 px-4 text-left text-sm text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300 disabled:cursor-not-allowed disabled:opacity-60">
                        <SelectValue
                          placeholder={
                            formData.categoryMain && getMiddleCategories().length === 0
                              ? '다음 분류가 없습니다.'
                              : '중분류'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="z-[80] max-h-60 overflow-auto scroll-smooth bg-bg-100">
                        {getMiddleCategories().length > 0 &&
                          getMiddleCategories().map((category: string) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="cursor-pointer text-text-100 hover:bg-primary-100 hover:text-primary-300 focus:bg-primary-100 focus:text-primary-300"
                            >
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={formData.categorySub}
                      onValueChange={handleCategorySubChange}
                      disabled={!formData.categoryMiddle || getSubCategories().length === 0}
                    >
                      <SelectTrigger className="h-12 w-1/3 rounded-lg border-bg-300 bg-bg-100 px-4 text-left text-sm text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300 disabled:cursor-not-allowed disabled:opacity-60">
                        <SelectValue
                          placeholder={
                            formData.categoryMiddle && getSubCategories().length === 0
                              ? '다음 분류가 없습니다.'
                              : '소분류'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="z-[80] max-h-60 overflow-auto scroll-smooth bg-bg-100">
                        {getSubCategories().length > 0 &&
                          getSubCategories().map((category: string) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="cursor-pointer text-text-100 hover:bg-primary-100 hover:text-primary-300 focus:bg-primary-100 focus:text-primary-300"
                            >
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </FormField>

            {/* 태그 */}
            <FormField label={`태그 (${selectedTags.length}/3)`} required>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : error ? (
                <div className="text-sm text-red-500">태그 정보를 불러오지 못했습니다.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div
                    className="grid grid-cols-5 gap-2"
                    role="group"
                    aria-label="태그 선택 그리드"
                  >
                    {Array.from({ length: 20 }, (_, i) => tags[i] || null).map((tag, idx) =>
                      tag ? (
                        <button
                          key={tag.value}
                          type="button"
                          className={`${FORM_STYLES.button.selectable.base} w-full ${
                            selectedTags.some((t) => t.value === tag.value)
                              ? 'border-primary-300 bg-primary-100 text-primary-300'
                              : 'border-bg-300 text-text-300 hover:bg-bg-200'
                          }`}
                          aria-pressed={selectedTags.some((t) => t.value === tag.value)}
                          onClick={() => handleTagToggle(tag)}
                        >
                          <span className="block w-full truncate text-center">{tag.label}</span>
                        </button>
                      ) : (
                        <div key={idx} />
                      ),
                    )}
                  </div>
                </div>
              )}
            </FormField>
          </div>
        </section>

        {/* 옵션 관리 */}
        <section>
          <SectionHeader
            title="상품 옵션 설정"
            description="판매할 상품의 다양한 옵션을 설정해주세요"
          />

          <div className="mt-8">
            <OptionList
              options={optionArray.items}
              onChange={handleOptionChange}
              onRemove={handleOptionRemove}
              onImageUpload={handleOptionImageUpload}
            />
            <Button
              type="button"
              onClick={handleAddOption}
              className={FORM_STYLES.button.submit + ' mt-4 w-full'}
            >
              옵션 추가하기
            </Button>
          </div>
        </section>

        {/* 화장품 정보제공고시 */}
        <section>
          <SectionHeader
            title="화장품 정보제공고시"
            description="화장품 판매에 따른 필수 정보입니다. 정확하게 입력해주세요."
          />

          <div className="mt-8 space-y-6">
            <div className="flex gap-2">
              <FormField label="내용물의 용량 또는 중량" required className="flex-1">
                <Input
                  value={formData.capacity}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 숫자와 소수점만 허용
                    const filteredValue = value.replace(/[^0-9.]/g, '');
                    // 소수점이 2개 이상이면 첫 번째 것만 유지
                    const parts = filteredValue.split('.');
                    const processedValue =
                      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filteredValue;
                    handleInputChange('capacity', processedValue);
                  }}
                  placeholder="예: 50, 100.5, 200 등 숫자 입력"
                  className={FORM_STYLES.input.base}
                  inputMode="decimal"
                  pattern="[0-9.]*"
                />
              </FormField>
              <FormField label="단위" required className="w-32">
                <Select
                  value={formData.capacityUnit}
                  onValueChange={(value) => handleInputChange('capacityUnit', value)}
                >
                  <SelectTrigger className="h-12 rounded-lg border-bg-300 bg-bg-100 px-4 text-left text-sm text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[80] max-h-60 bg-bg-100">
                    {CAPACITY_UNITS.map((unit) => (
                      <SelectItem
                        key={unit}
                        value={unit}
                        className="cursor-pointer text-text-100 hover:bg-primary-100 hover:text-primary-300 focus:bg-primary-100 focus:text-primary-300"
                      >
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="제품 주요 사양" required>
              <Input
                value={formData.specification}
                onChange={(e) => handleInputChange('specification', e.target.value)}
                placeholder="EX) 모든 피부"
                className={FORM_STYLES.input.base}
              />
            </FormField>
            <FormField label="사용기한(또는 개봉 후 사용기간)" required>
              <Input
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="EX) 제조일로부터 24개월"
                className={FORM_STYLES.input.base}
              />
            </FormField>
            <FormField label="사용법" required>
              <Textarea
                value={formData.usage}
                onChange={(e) => handleInputChange('usage', e.target.value)}
                placeholder="EX) 적당량의 내용을 손에 덜어 얼굴에 부드럽게 펴 발라줍니다."
                className={FORM_STYLES.textarea.base}
                rows={2}
              />
            </FormField>
            <FormField label="화장품제조업자" required>
              <Input
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder=""
                className={FORM_STYLES.input.base}
              />
            </FormField>
            <FormField label="화장품책임판매업자" required>
              <Input
                value={formData.seller}
                onChange={(e) => handleInputChange('seller', e.target.value)}
                placeholder=""
                className={FORM_STYLES.input.base}
              />
            </FormField>
            <FormField label="제조국" required>
              <Input
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="대한민국"
                className={FORM_STYLES.input.base}
              />
            </FormField>
            <FormField label="기능성 화장품 식품의약품안전처 심사필 여부" required>
              <div className="mt-2 flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="functionalTest"
                    value="yes"
                    checked={formData.functionalTest === 'yes'}
                    onChange={(e) => handleInputChange('functionalTest', e.target.value)}
                    className="custom-radio"
                  />
                  <span className="text-sm text-text-100">있음</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="functionalTest"
                    value="no"
                    checked={formData.functionalTest === 'no'}
                    onChange={(e) => handleInputChange('functionalTest', e.target.value)}
                    className="custom-radio"
                  />
                  <span className="text-sm text-text-100">없음</span>
                </label>
              </div>
            </FormField>
            <FormField label="사용할 때의 주의사항" required>
              <Textarea
                value={formData.precautions}
                onChange={(e) => handleInputChange('precautions', e.target.value)}
                placeholder=""
                className={FORM_STYLES.textarea.base}
                rows={2}
              />
            </FormField>
            <FormField label="품질보증기준" required>
              <Textarea
                value={formData.qualityStandard}
                onChange={(e) => handleInputChange('qualityStandard', e.target.value)}
                placeholder="EX) 본 상품에 이상이 있을 경우 공정거래위원회 고시 '소비자분쟁 해결기준'에 의해 보상해 드립니다."
                className={FORM_STYLES.textarea.base}
                rows={2}
              />
            </FormField>
            <FormField
              label="소비자상담 전화번호"
              required
              helperText="번호는 하이픈(-)을 포함해서 입력해주세요. 예: 0000-0000"
            >
              <Input
                value={formData.customerService}
                onChange={(e) => {
                  const value = e.target.value;
                  // 숫자와 하이픈만 허용하는 정규식
                  const filteredValue = value.replace(/[^0-9-]/g, '');
                  handleInputChange('customerService', filteredValue);
                }}
                placeholder="0000-0000"
                className={FORM_STYLES.input.base}
                maxLength={13}
              />
            </FormField>
          </div>
        </section>

        {/* 등록 버튼 */}
        <div className="pt-8">
          <Button
            type="submit"
            className="h-12 w-full rounded-lg bg-primary-300 text-sm font-medium text-text-on transition hover:opacity-80 focus:ring-primary-300 active:opacity-90"
            disabled={submitLoading}
          >
            {submitLoading ? '등록 중...' : '등록하기'}
          </Button>
          <ErrorDialog
            isOpen={!!submitError}
            onClose={handleErrorDialogClose}
            title="상품 등록 실패"
            message={submitError || ''}
          />
          <SuccessDialog
            isOpen={submitSuccess}
            onClose={handleSuccessDialogClose}
            title="상품 등록 완료"
            message="상품이 성공적으로 등록되었습니다."
          />
        </div>
      </form>
    </div>
  );
}
