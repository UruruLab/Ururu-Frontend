'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">로그아웃</DialogTitle>
        </DialogHeader>
        <div className="mb-6 text-sm text-text-200">정말 로그아웃하시겠어요?</div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full border-0 bg-bg-100 text-text-200 shadow-none hover:bg-bg-200 sm:w-auto"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full border border-primary-300 bg-primary-300 text-text-on shadow-none transition-opacity hover:opacity-80 sm:w-auto"
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
