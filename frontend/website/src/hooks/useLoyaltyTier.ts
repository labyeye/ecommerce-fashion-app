import { useAuth } from '../context/AuthContext';

export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

export function useLoyaltyTier(): LoyaltyTier {
  const { user } = useAuth();
  
  // If no user or no loyalty tier set, default to bronze
  if (!user || !user.loyaltyTier) return 'bronze';
  
  // Convert the user's loyalty tier to the correct type
  const tier = user.loyaltyTier.toLowerCase() as LoyaltyTier;
  
  // Validate the tier
  if (tier === 'gold' || tier === 'silver' || tier === 'bronze') {
    return tier;
  }
  
  // Default to bronze if the tier is invalid
  return 'bronze';
}

export function canAccessTier(userTier: LoyaltyTier, requiredTier: LoyaltyTier): boolean {
  const tiers = ['bronze', 'silver', 'gold'];
  const userTierIndex = tiers.indexOf(userTier);
  const requiredTierIndex = tiers.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
}
