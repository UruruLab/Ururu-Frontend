import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'bg-muted relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  );
}

export interface AvatarImageProps
  extends Omit<React.ComponentProps<typeof Image>, 'width' | 'height' | 'alt' | 'src'> {
  width?: number;
  height?: number;
  alt?: string;
  src?: string;
}

export function AvatarImage({
  className,
  width = 40,
  height = 40,
  alt = '',
  src,
  ...props
}: AvatarImageProps) {
  if (!src) {
    return null;
  }

  return (
    <Image
      className={cn('aspect-square h-full w-full object-cover', className)}
      width={width}
      height={height}
      alt={alt}
      src={src}
      {...props}
    />
  );
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <span
      className={cn(
        'bg-muted flex h-full w-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  );
}
