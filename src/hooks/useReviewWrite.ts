import { useState, useEffect, useRef } from 'react';
import { getReviewOptionsByCategoryId, CategoryReviewOptions } from '@/data/review-options';

export interface ReviewData {
  rating: number;
  attributes: Record<string, string>;
  images: File[];
  text: string;
}

interface UseReviewWriteProps {
  categoryId?: number;
}

export const useReviewWrite = ({ categoryId }: UseReviewWriteProps = {}) => {
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 4,
    attributes: {},
    images: [],
    text: '',
  });

  const [categoryOptions, setCategoryOptions] = useState<CategoryReviewOptions | null>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // 카테고리 ID가 변경될 때마다 해당 카테고리의 리뷰 옵션을 설정
  useEffect(() => {
    if (categoryId) {
      const options = getReviewOptionsByCategoryId(categoryId);
      setCategoryOptions(options || null);

      // 새로운 카테고리의 경우 attributes 초기화
      if (options) {
        const initialAttributes: Record<string, string> = {};
        options.attributes.forEach((attr) => {
          initialAttributes[attr.name] = '';
        });
        setReviewData((prev) => ({
          ...prev,
          attributes: initialAttributes,
        }));
      }
    }
  }, [categoryId]);

  // 컴포넌트 언마운트 시 객체 URL 정리
  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      objectUrls.clear();
    };
  }, []);

  const createObjectUrl = (file: File): string => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    return url;
  };

  const handleRatingChange = (rating: number) => {
    setReviewData((prev) => ({ ...prev, rating }));
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setReviewData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeName]: value,
      },
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setReviewData((prev) => ({ ...prev, text: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (reviewData.images.length + files.length <= 5) {
      setReviewData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    }
  };

  const handleImageRemove = (index: number) => {
    setReviewData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 리뷰 작성 API 호출
    // TODO: API 호출 로직 추가
  };

  // 필수 필드 검증
  const isFormValid = () => {
    if (!categoryOptions) return false;

    // 별점은 항상 필수
    if (reviewData.rating === 0) return false;

    // 모든 속성이 선택되었는지 확인
    const allAttributesSelected = categoryOptions.attributes.every(
      (attr) => reviewData.attributes[attr.name] !== '',
    );

    // 텍스트 리뷰는 필수
    if (reviewData.text.trim() === '') return false;

    return allAttributesSelected;
  };

  return {
    reviewData,
    categoryOptions,
    createObjectUrl,
    handleRatingChange,
    handleAttributeChange,
    handleTextChange,
    handleImageUpload,
    handleImageRemove,
    handleSubmit,
    isFormValid: isFormValid(),
  };
};
