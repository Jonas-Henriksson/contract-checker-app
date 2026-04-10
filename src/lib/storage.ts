const STORAGE_KEY = 'contract_checker_reviews';
const FREE_REVIEWS = 1;

export function getReviewsUsed(): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem(STORAGE_KEY);
  return val ? parseInt(val, 10) : 0;
}

export function incrementReviews(): void {
  if (typeof window === 'undefined') return;
  const current = getReviewsUsed();
  localStorage.setItem(STORAGE_KEY, String(current + 1));
}

export function hasFreeReview(): boolean {
  return getReviewsUsed() < FREE_REVIEWS;
}

export function getReviewsRemaining(): number {
  const used = getReviewsUsed();
  if (used < FREE_REVIEWS) return FREE_REVIEWS - used;
  const purchased = getPurchasedReviews();
  return Math.max(0, purchased - (used - FREE_REVIEWS));
}

export function getPurchasedReviews(): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem('contract_checker_purchased');
  return val ? parseInt(val, 10) : 0;
}

export function setPurchasedReviews(count: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('contract_checker_purchased', String(count));
}

export function canReview(): boolean {
  return hasFreeReview() || getReviewsRemaining() > 0;
}
