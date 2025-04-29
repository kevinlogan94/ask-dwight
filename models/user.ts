/**
 * User and subscription models
 */

/**
 * Subscription interface aligned with Stripe subscription data
 */
export interface Subscription {
  // Stripe-specific identifiers
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  
  // Subscription details
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  tier: 'free' | 'premium' | 'enterprise';
  
  // Billing cycle information
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  
  // Payment information
  priceId?: string;  // Stripe price/plan ID
}

/**
 * User interface with Stripe subscription information
 */
export interface User {
  id: string;
  name: string;
  email: string;
  subscription: Subscription | null; // null for users with no subscription data yet
  createdAt: Date;
}
