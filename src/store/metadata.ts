import { create } from 'zustand';
import { ProductService } from '@/services/productService';
import type { Category, Tag } from '@/types/product';

interface MetadataState {
  categories: Category[];
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  fetchMetadata: (force?: boolean) => Promise<void>;
  hydrateFromCache: () => void;
}

const LOCAL_KEY = 'ururu_metadata';
const CACHE_EXPIRE_MS = 1000 * 60 * 60; // 1시간

export const useMetadataStore = create<MetadataState>((set) => ({
  categories: [],
  tags: [],
  isLoading: false,
  error: null,
  // 1. localStorage에서 데이터+만료 체크 후 store에 반영
  hydrateFromCache: () => {
    if (typeof window === 'undefined') return;
    const cached = localStorage.getItem(LOCAL_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const expired = !parsed.cachedAt || Date.now() - parsed.cachedAt > CACHE_EXPIRE_MS;
        if (!expired) {
          set({
            categories: parsed.categories ?? [],
            tags: parsed.tags ?? [],
          });
        }
      } catch {}
    }
  },
  // 2. API에서 최신 데이터 불러오기 + localStorage에 저장
  fetchMetadata: async (force = false) => {
    set({ isLoading: true, error: null });
    try {
      // SSR 환경: 항상 API에서 받아옴, 클라이언트: force=true면 강제 새로고침
      const data = await ProductService.getProductMetadata();
      set({ categories: data.categories, tags: data.tags, isLoading: false });
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...data, cachedAt: Date.now() }));
      }
    } catch (e: any) {
      set({ error: e.message ?? '메타데이터 로드 실패', isLoading: false });
    }
  },
}));
