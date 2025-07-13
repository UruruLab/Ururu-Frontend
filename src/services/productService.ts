import api from '@/lib/axios';
import type { ProductMetadataResponse } from '@/types/product';
import type { ApiResponse } from '@/types/api';
import { cookies } from 'next/headers';

export class ProductService {
  // 상품 등록을 위한 메타데이터 조회 (카테고리, 태그)
  static async getProductMetadata(): Promise<ProductMetadataResponse> {
    const response = await api.get<ApiResponse<ProductMetadataResponse>>('/products/create');

    if (!response.data.success) {
      throw new Error(response.data.message || '상품 메타데이터 조회에 실패했습니다.');
    }

    return response.data.data!;
  }
}

// 서버 컴포넌트용 fetch 함수
export async function fetchProductMetadata(): Promise<ProductMetadataResponse> {
  const cookie = cookies().toString();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products/create`,
    {
      headers: { Cookie: cookie },
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    const error = new Error(`상품 메타데이터 조회에 실패했습니다. status: ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || '상품 메타데이터 조회에 실패했습니다.');
  }
  return data.data;
}
