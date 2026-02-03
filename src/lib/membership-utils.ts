// Membership benefits utility functions

export interface MembershipBenefits {
  productDiscount: number;
  serviceDiscount: number;
  pointsRate: number;
  freeRefillsPerMonth: number;
  freeFullSetsPerMonth: number;
  includedServiceIds: string[];
}

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  popular: boolean;
  features: string[];
  benefits: MembershipBenefits;
}

export interface UserMembership {
  tierId: string;
  tierName: string;
  status: 'active' | 'cancelled' | 'past_due';
  usage?: {
    currentPeriodStart: string;
    refillsUsed: number;
    fullSetsUsed: number;
  };
}

export interface UserPoints {
  balance: number;
  lifetimeEarned: number;
}

/**
 * Calculate the discounted price for a product based on membership
 */
export function calculateMemberProductPrice(
  originalPrice: number,
  membershipBenefits: MembershipBenefits | null
): { price: number; discount: number; savings: number } {
  if (!membershipBenefits || membershipBenefits.productDiscount <= 0) {
    return { price: originalPrice, discount: 0, savings: 0 };
  }

  const discount = membershipBenefits.productDiscount;
  const savings = originalPrice * (discount / 100);
  const price = originalPrice - savings;

  return { price: Math.round(price * 100) / 100, discount, savings: Math.round(savings * 100) / 100 };
}

/**
 * Calculate the discounted price for a service based on membership
 */
export function calculateMemberServicePrice(
  originalPrice: number,
  serviceId: string,
  membershipBenefits: MembershipBenefits | null,
  usage: UserMembership['usage'] | undefined,
  isRefill: boolean = false,
  isFullSet: boolean = false
): { price: number; discount: number; savings: number; isFree: boolean; reason?: string } {
  if (!membershipBenefits) {
    return { price: originalPrice, discount: 0, savings: 0, isFree: false };
  }

  // Check if service is included in membership
  if (membershipBenefits.includedServiceIds.includes(serviceId)) {
    return { price: 0, discount: 100, savings: originalPrice, isFree: true, reason: 'Included in membership' };
  }

  // Check for free refills
  if (isRefill && membershipBenefits.freeRefillsPerMonth > 0) {
    const refillsUsed = usage?.refillsUsed || 0;
    if (refillsUsed < membershipBenefits.freeRefillsPerMonth) {
      return { 
        price: 0, 
        discount: 100, 
        savings: originalPrice, 
        isFree: true, 
        reason: `Free refill (${refillsUsed + 1}/${membershipBenefits.freeRefillsPerMonth} used)` 
      };
    }
  }

  // Check for free full sets
  if (isFullSet && membershipBenefits.freeFullSetsPerMonth > 0) {
    const fullSetsUsed = usage?.fullSetsUsed || 0;
    if (fullSetsUsed < membershipBenefits.freeFullSetsPerMonth) {
      return { 
        price: 0, 
        discount: 100, 
        savings: originalPrice, 
        isFree: true, 
        reason: `Free full set (${fullSetsUsed + 1}/${membershipBenefits.freeFullSetsPerMonth} used)` 
      };
    }
  }

  // Apply service discount
  if (membershipBenefits.serviceDiscount > 0) {
    const discount = membershipBenefits.serviceDiscount;
    const savings = originalPrice * (discount / 100);
    const price = originalPrice - savings;
    return { price: Math.round(price * 100) / 100, discount, savings: Math.round(savings * 100) / 100, isFree: false };
  }

  return { price: originalPrice, discount: 0, savings: 0, isFree: false };
}

// Points configuration
export const POINTS_CONFIG = {
  MINIMUM_REDEMPTION: 100, // Minimum points required to redeem
  POINTS_PER_DOLLAR: 1, // 1 point = $1 discount
  EARN_ON_SERVICES_ONLY: true, // Points only earned on service bookings
  REDEEM_ON_SERVICES_ONLY: true, // Points only redeemable on services
};

/**
 * Calculate points earned from a service booking
 * Points are only earned on services, not products
 */
export function calculatePointsEarned(
  serviceAmount: number,
  pointsRate: number
): number {
  if (pointsRate <= 0) return 0;
  // pointsRate is percentage, e.g., 5 means 5% back in points
  return Math.floor(serviceAmount * (pointsRate / 100));
}

/**
 * Calculate how much a points balance is worth in dollars
 * 1 point = $1
 */
export function calculatePointsValue(points: number): number {
  return points * POINTS_CONFIG.POINTS_PER_DOLLAR;
}

/**
 * Check if user can redeem points
 */
export function canRedeemPoints(pointsBalance: number): boolean {
  return pointsBalance >= POINTS_CONFIG.MINIMUM_REDEMPTION;
}

/**
 * Calculate maximum points that can be redeemed for a service
 * Cannot redeem more than the service cost or more than available balance
 */
export function calculateMaxRedeemablePoints(
  pointsBalance: number,
  serviceAmount: number
): number {
  if (!canRedeemPoints(pointsBalance)) return 0;
  
  // Max points = service amount (since 1 point = $1)
  const maxForService = Math.floor(serviceAmount);
  
  return Math.min(pointsBalance, maxForService);
}

/**
 * Calculate discount from redeemed points
 */
export function calculatePointsDiscount(pointsToRedeem: number): number {
  return pointsToRedeem * POINTS_CONFIG.POINTS_PER_DOLLAR;
}

/**
 * Check if the membership period has reset (for usage tracking)
 */
export function shouldResetUsage(
  currentPeriodStart: string | undefined,
  membershipPeriodEnd: string | undefined
): boolean {
  if (!currentPeriodStart || !membershipPeriodEnd) return true;
  
  const periodStart = new Date(currentPeriodStart);
  const periodEnd = new Date(membershipPeriodEnd);
  const now = new Date();
  
  // If we're past the period end, usage should reset
  if (now > periodEnd) return true;
  
  // If the period start is more than a month ago, usage should reset
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  if (periodStart < oneMonthAgo) return true;
  
  return false;
}

/**
 * Get remaining free services for the current period
 */
export function getRemainingFreeServices(
  membershipBenefits: MembershipBenefits,
  usage: UserMembership['usage'] | undefined
): { refills: number; fullSets: number } {
  const refillsUsed = usage?.refillsUsed || 0;
  const fullSetsUsed = usage?.fullSetsUsed || 0;
  
  return {
    refills: Math.max(0, membershipBenefits.freeRefillsPerMonth - refillsUsed),
    fullSets: Math.max(0, membershipBenefits.freeFullSetsPerMonth - fullSetsUsed)
  };
}

/**
 * Get membership benefits from tier ID
 */
export function getMembershipBenefits(
  tierId: string,
  tiers: Array<{ id: string; benefits?: Partial<MembershipBenefits> }>
): MembershipBenefits | null {
  const tier = tiers.find(t => t.id === tierId);
  if (!tier || !tier.benefits) return null;
  
  return {
    productDiscount: tier.benefits.productDiscount || 0,
    serviceDiscount: tier.benefits.serviceDiscount || 0,
    pointsRate: tier.benefits.pointsRate || 0,
    freeRefillsPerMonth: tier.benefits.freeRefillsPerMonth || 0,
    freeFullSetsPerMonth: tier.benefits.freeFullSetsPerMonth || 0,
    includedServiceIds: tier.benefits.includedServiceIds || []
  };
}

/**
 * Calculate discounted product price (simple helper)
 */
export function calculateProductDiscount(
  originalPrice: number,
  benefits: MembershipBenefits | null
): number {
  if (!benefits || benefits.productDiscount <= 0) {
    return originalPrice;
  }
  const discountAmount = originalPrice * (benefits.productDiscount / 100);
  return Math.round((originalPrice - discountAmount) * 100) / 100;
}
