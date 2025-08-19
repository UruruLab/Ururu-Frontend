'use client';

import { PersonalizedSection } from './PersonalizedSection';
import { useAiPersonalizedProducts } from '@/hooks/useAiPersonalizedProducts';

export default function PersonalizedSectionClient() {
  const { products = [], loading, error } = useAiPersonalizedProducts();

  return <PersonalizedSection products={products} loading={loading} error={error} />;
}
