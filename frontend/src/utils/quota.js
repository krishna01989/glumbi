/**
 * Returns true when the user is truly out of credits (monthly limit reached AND
 * no active promo credits remaining). Feature guards should disable AI calls when
 * this returns true.
 */
export function isCreditsBlocked(quota) {
  if (!quota) return false
  if (quota.used < quota.limit) return false
  return !((quota.totalPromoRemaining ?? 0) > 0)
}
