'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { HeroBanner } from '@/data/home';

interface HeroCarouselProps {
  banners: HeroBanner[];
  className?: string;
}

export function HeroCarousel({ banners, className = '' }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg ${className}`}
      style={{ height: '100%' }}
    >
      {/* 배너 슬라이드 - 부모 높이 100% */}
      <div className="relative h-full w-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={banner.image}
              alt={`배너 ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
