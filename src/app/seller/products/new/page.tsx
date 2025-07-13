import { redirect } from 'next/navigation';
import { ProductRegistration } from '@/components/seller/ProductRegistration';
import { fetchProductMetadata } from '@/services/productService';

export default async function NewProductPage() {
  try {
    const { categories, tags } = await fetchProductMetadata();
    return <ProductRegistration categories={categories} tags={tags} />;
  } catch (error: any) {
    // 403 에러 감지 (status 프로퍼티 또는 message 파싱)
    if (
      (typeof error.status === 'number' && error.status === 403) ||
      (typeof error.message === 'string' && error.message.includes('status: 403'))
    ) {
      redirect(`/login?redirect=${encodeURIComponent('/seller/products/new')}`);
    }
    throw error;
  }
}
