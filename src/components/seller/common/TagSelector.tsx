import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tag, SelectedTags } from '@/types/product';

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: SelectedTags;
  onTagsChange: (tags: SelectedTags) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const MAX_SELECTED_TAGS = 3;

export function TagSelector({
  tags,
  selectedTags,
  onTagsChange,
  isLoading,
  error,
  className,
}: TagSelectorProps) {
  // 태그 선택/해제 핸들러
  const handleTagClick = (tag: Tag) => {
    const isSelected = selectedTags.some((t) => t.value === tag.value);
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t.value !== tag.value));
    } else if (selectedTags.length < MAX_SELECTED_TAGS) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {/* 태그 버튼 그리드 */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-400">태그 불러오는 중...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">태그 정보를 불러오지 못했습니다.</div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {tags.slice(0, 20).map((tag) => {
            const isSelected = selectedTags.some((t) => t.value === tag.value);
            return (
              <Button
                key={tag.value}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTagClick(tag)}
                disabled={!isSelected && selectedTags.length >= MAX_SELECTED_TAGS}
                className={`h-10 whitespace-nowrap text-sm ${
                  isSelected
                    ? 'hover:bg-primary-400 bg-primary-300 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tag.label}
              </Button>
            );
          })}
        </div>
      )}
      {/* 선택된 태그 표시 */}
      {selectedTags.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <span>선택된 태그:</span>
          {selectedTags.map((tag) => (
            <span
              key={tag.value}
              className="text-primary-700 flex items-center gap-1 rounded-md bg-primary-100 px-2 py-1"
            >
              {tag.label}
              <button
                type="button"
                onClick={() => handleTagClick(tag)}
                className="text-primary-500 hover:text-primary-700 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
