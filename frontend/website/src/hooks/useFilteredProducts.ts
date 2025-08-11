import { useEffect, useState } from 'react';
import { getProducts, Product } from '../services/productService';
import { useLoyaltyTier } from './useLoyaltyTier';

export const useFilteredProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userTier = useLoyaltyTier();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getProducts();
        
        // Filter products based on user's loyalty tier
        const filteredProducts = allProducts.filter(product => {
          // If no minimum tier is set, everyone can access
          if (!product.minLoyaltyTier) return true;

          // Define tier levels
          const tiers = { bronze: 0, silver: 1, gold: 2 };
          const userTierLevel = tiers[userTier as keyof typeof tiers];
          const requiredTierLevel = tiers[product.minLoyaltyTier as keyof typeof tiers];

          // User can access if their tier level is >= required level
          return userTierLevel >= requiredTierLevel;
        });

        setProducts(filteredProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userTier]);

  return { products, loading, error };
};
