import { useState, useEffect } from 'react';
import { ProductService } from '@/services/productService';
import type { Category, Tag, SelectedCategory, SelectedTags } from '@/types/product';

export function useProductMetadata() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>({
    mainCategory: null,
    subCategory: null,
    detailCategory: null,
  });
  const [selectedTags, setSelectedTags] = useState<SelectedTags>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 메타데이터 강제 새로고침 (필요시 사용)
  const reloadMetadata = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const metadata = await ProductService.getProductMetadata();
      setCategories(metadata.categories);
      setTags(metadata.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : '메타데이터 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: SelectedCategory) => {
    setSelectedCategory(category);
  };

  // 태그 변경 핸들러
  const handleTagsChange = (tags: SelectedTags) => {
    setSelectedTags(tags);
  };

  // 선택된 카테고리 ID 가져오기 (최종 선택된 카테고리)
  const getSelectedCategoryId = (): number | null => {
    if (selectedCategory.detailCategory) {
      return selectedCategory.detailCategory.value;
    }
    if (selectedCategory.subCategory) {
      return selectedCategory.subCategory.value;
    }
    if (selectedCategory.mainCategory) {
      return selectedCategory.mainCategory.value;
    }
    return null;
  };

  // 선택된 태그 ID 배열 가져오기
  const getSelectedTagIds = (): number[] => {
    return selectedTags.map((tag) => tag.value);
  };

  // 초기 로드 (중복 호출 방지)
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (categories.length > 0 || tags.length > 0) return; // 이미 데이터가 있으면 스킵

      setIsLoading(true);
      setError(null);

      try {
        const metadata = await ProductService.getProductMetadata();
        if (isMounted) {
          setCategories(metadata.categories);
          setTags(metadata.tags);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '메타데이터 로드에 실패했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [categories.length, tags.length]);

  return {
    categories,
    tags,
    selectedCategory,
    selectedTags,
    isLoading,
    error,
    handleCategoryChange,
    handleTagsChange,
    getSelectedCategoryId,
    getSelectedTagIds,
    reloadMetadata,
  };
}
