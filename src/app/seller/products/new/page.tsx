import { ProductRegistration } from '@/components/seller/ProductRegistration';
import { fetchProductMetadata } from '@/services/productService';

export default async function NewProductPage() {
  const { categories, tags } = await fetchProductMetadata();
  return <ProductRegistration categories={categories} tags={tags} />;
}
