import { useMemo } from 'react';
import { Product } from '../services/productService';
import { useLoyaltyTier } from './useLoyaltyTier';

const tierHierarchy = {
  bronze: 0,
  silver: 1,
  gold: 2
};

export const useProductAccess = (products: Product[] | null) => {
  const userTier = useLoyaltyTier();

  return useMemo(() => {
    if (!products) return [];
    
    // Filter products based on user's loyalty tier
    return products.filter(product => {
      // If no minimum tier is set, everyone can access
      if (!product.minLoyaltyTier) return true;

      // Compare user's tier level with product's required tier
      const userTierLevel = tierHierarchy[userTier];
      const requiredTierLevel = tierHierarchy[product.minLoyaltyTier];

      return userTierLevel >= requiredTierLevel;
    });
  }, [products, userTier]);
};

export const canAccessProduct = (product: Product | null, userTier: string): boolean => {
  if (!product || !product.minLoyaltyTier) return true;

  const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
  const requiredTierLevel = tierHierarchy[product.minLoyaltyTier as keyof typeof tierHierarchy] || 0;

  return userTierLevel >= requiredTierLevel;
};
