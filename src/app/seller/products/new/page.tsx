import { ProductRegistration } from '@/components/seller/ProductRegistration';
import { fetchProductMetadata } from '@/services/productService';
import { handleAuthError } from '@/lib/serverAuthUtils';

export default async function NewProductPage() {
  try {
    const { categories, tags } = await fetchProductMetadata();
    return <ProductRegistration categories={categories} tags={tags} />;
  } catch (error: any) {
    handleAuthError(error, { fallbackPath: '/seller/products/new' });
  }
}
