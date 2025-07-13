import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category, SelectedCategory } from '@/types/product';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: SelectedCategory;
  onCategoryChange: (category: SelectedCategory) => void;
  className?: string;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
  className,
}: CategorySelectorProps) {
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [detailCategories, setDetailCategories] = useState<Category[]>([]);

  // 메인 카테고리 변경 시 하위 카테고리 업데이트
  useEffect(() => {
    if (selectedCategory.mainCategory) {
      setSubCategories(selectedCategory.mainCategory.children);
      setDetailCategories([]);
    } else {
      setSubCategories([]);
      setDetailCategories([]);
    }
  }, [selectedCategory.mainCategory]);

  // 서브 카테고리 변경 시 상세 카테고리 업데이트
  useEffect(() => {
    if (selectedCategory.subCategory) {
      setDetailCategories(selectedCategory.subCategory.children);
    } else {
      setDetailCategories([]);
    }
  }, [selectedCategory.subCategory]);

  const handleMainCategoryChange = (value: string) => {
    const category = categories.find((cat) => cat.value.toString() === value);
    onCategoryChange({
      mainCategory: category || null,
      subCategory: null,
      detailCategory: null,
    });
  };

  const handleSubCategoryChange = (value: string) => {
    const category = subCategories.find((cat) => cat.value.toString() === value);
    onCategoryChange({
      ...selectedCategory,
      subCategory: category || null,
      detailCategory: null,
    });
  };

  const handleDetailCategoryChange = (value: string) => {
    const category = detailCategories.find((cat) => cat.value.toString() === value);
    onCategoryChange({
      ...selectedCategory,
      detailCategory: category || null,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">카테고리 선택</label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* 메인 카테고리 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500">대분류</label>
            <Select
              value={selectedCategory.mainCategory?.value.toString() || ''}
              onValueChange={handleMainCategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="대분류를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value.toString()}>
                      {category.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {/* 서브 카테고리 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500">중분류</label>
            <Select
              value={selectedCategory.subCategory?.value.toString() || ''}
              onValueChange={handleSubCategoryChange}
              disabled={!selectedCategory.mainCategory || subCategories.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="중분류를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                  {subCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value.toString()}>
                      {category.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {/* 상세 카테고리 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500">소분류</label>
            <Select
              value={selectedCategory.detailCategory?.value.toString() || ''}
              onValueChange={handleDetailCategoryChange}
              disabled={!selectedCategory.subCategory || detailCategories.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="소분류를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                  {detailCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value.toString()}>
                      {category.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 선택된 카테고리 표시 */}
      {selectedCategory.mainCategory && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>선택된 카테고리:</span>
          <span className="font-medium">
            {selectedCategory.mainCategory.label}
            {selectedCategory.subCategory && ` > ${selectedCategory.subCategory.label}`}
            {selectedCategory.detailCategory && ` > ${selectedCategory.detailCategory.label}`}
          </span>
        </div>
      )}
    </div>
  );
}
