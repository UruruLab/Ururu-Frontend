import React, { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { FormField } from '@/components/form/FormField';
import { ErrorDialog } from '@/components/common/ErrorDialog';

interface ImageUploadFieldProps {
  label: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  placeholder?: string;
  uploadedFiles?: File[];
  existingImageUrl?: string; // 기존 이미지 URL 추가
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void; // 순서 변경 핸들러 추가
  id: string;
  variant?: 'default' | 'option'; // 옵션 이미지용 variant 추가
}

export function ImageUploadField({
  label,
  required = false,
  multiple = false,
  accept = 'image/*',
  placeholder = '이미지를 업로드하세요',
  uploadedFiles = [],
  existingImageUrl,
  onUpload,
  onRemove,
  onReorder,
  id,
  variant = 'default',
}: ImageUploadFieldProps) {
  const isOptionVariant = variant === 'option';
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (multiple && uploadedFiles.length + files.length > 10) {
      setIsErrorOpen(true);
      e.target.value = '';
      return;
    }

    onUpload(e);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    if (multiple && uploadedFiles.length >= 10) {
      e.preventDefault();
      setIsErrorOpen(true);
      return;
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const isMaxReached = multiple && uploadedFiles.length >= 10;

  return (
    <FormField label={label} required={required}>
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center ${
          isMaxReached
            ? 'bg-bg-50 cursor-not-allowed border-bg-200'
            : `cursor-pointer border-bg-300 ${isOptionVariant ? 'bg-bg-100' : ''}`
        }`}
        onClick={handleUploadClick}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          multiple={multiple}
          onChange={handleUpload}
          className="hidden"
          id={id}
          disabled={isMaxReached}
        />
        <label
          htmlFor={id}
          className={`flex flex-col items-center justify-center ${
            isMaxReached ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <Upload className={`mb-2 h-8 w-8 ${isMaxReached ? 'text-text-200' : 'text-text-300'}`} />
          <span className={`text-sm ${isMaxReached ? 'text-text-200' : 'text-text-300'}`}>
            {isMaxReached ? '최대 10개까지 업로드 가능합니다' : placeholder}
          </span>
        </label>
        {/* 대표 이미지 미리보기 */}
        {!multiple && uploadedFiles.length === 1 && (
          <div className="mt-4 flex flex-col items-center">
            <div
              className="relative"
              style={{
                maxWidth: isOptionVariant ? 120 : 240,
                maxHeight: isOptionVariant ? 90 : 180,
              }}
            >
              <Image
                src={URL.createObjectURL(uploadedFiles[0])}
                alt="미리보기"
                width={isOptionVariant ? 120 : 240}
                height={isOptionVariant ? 90 : 180}
                className="rounded-lg object-contain"
                style={{
                  maxWidth: isOptionVariant ? 120 : 240,
                  maxHeight: isOptionVariant ? 90 : 180,
                  width: 'auto',
                  height: 'auto',
                }}
              />
            </div>
            <span className="mt-2 text-xs text-text-200">{uploadedFiles[0].name}</span>
          </div>
        )}

        {/* 기존 이미지 표시 (새 이미지가 업로드되지 않았을 때만) */}
        {!multiple &&
          uploadedFiles.length === 0 &&
          existingImageUrl &&
          existingImageUrl !== '/images/default-product-option.jpg' && (
            <div className="mt-4 flex flex-col items-center">
              <div
                className="relative"
                style={{
                  maxWidth: isOptionVariant ? 120 : 240,
                  maxHeight: isOptionVariant ? 90 : 180,
                }}
              >
                <Image
                  src={existingImageUrl}
                  alt="기존 이미지"
                  width={isOptionVariant ? 120 : 240}
                  height={isOptionVariant ? 90 : 180}
                  className="rounded-lg object-contain"
                  style={{
                    maxWidth: isOptionVariant ? 120 : 240,
                    maxHeight: isOptionVariant ? 90 : 180,
                    width: 'auto',
                    height: 'auto',
                  }}
                />
              </div>
            </div>
          )}
        {/* 파일명/개수 표시 */}
        {uploadedFiles.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <ImageIcon className="h-4 w-4 text-text-300" />
            <span className="text-sm text-text-200">
              {multiple ? `${uploadedFiles.length}개 파일` : uploadedFiles[0].name}
            </span>
          </div>
        )}
      </div>
      {multiple && uploadedFiles.length > 0 && onRemove && (
        <div className="mt-4 grid grid-cols-5 gap-4">
          {uploadedFiles.map((file, index) => {
            const isDragged = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={`image-${index}`}
                className={`relative cursor-move transition-all duration-300 ease-in-out ${
                  isDragged ? 'scale-95 opacity-50' : ''
                } ${isDragOver ? 'ring-2 ring-primary-300' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-bg-200">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`미리보기 ${index + 1}`}
                    width={100}
                    height={100}
                    className="pointer-events-none h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <p className="mt-1 truncate text-xs text-text-200">{file.name}</p>
              </div>
            );
          })}
          {/* 빈 슬롯들 */}
          {Array.from({ length: Math.max(0, 10 - uploadedFiles.length) }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
        </div>
      )}

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={() => setIsErrorOpen(false)}
        title="이미지 업로드 제한"
        message="상세 이미지는 최대 10개까지 업로드할 수 있습니다. 추가 이미지를 업로드하려면 기존 이미지를 먼저 삭제해주세요."
      />
    </FormField>
  );
}
