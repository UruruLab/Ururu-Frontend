import api from '@/lib/axios';
import type { ProductMetadataResponse } from '@/types/product';
import type { ApiResponse } from '@/types/api';

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
