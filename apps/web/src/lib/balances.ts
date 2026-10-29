import type { MemberBalance } from './types';

/**
 * A balance is treated as settled when it is exactly zero. Because all math is
 * in integer minor units there is no sub-cent rounding residue to threshold
 * away (unlike a float-based implementation).
 */
export type BalanceDirection = 'owed' | 'owes' | 'settled';

export function balanceDirection(netMinor: number): BalanceDirection {
  if (netMinor > 0) return 'owed';
  if (netMinor < 0) return 'owes';
  return 'settled';
}

export function isGroupSettled(balances: MemberBalance[]): boolean {
  return balances.every((b) => b.netMinor === 0);
}

/** Human label for a net balance from the given member's own perspective. */
export function balanceLabel(netMinor: number): string {
  const dir = balanceDirection(netMinor);
  if (dir === 'owed') return 'gets back';
  if (dir === 'owes') return 'owes';
  return 'settled up';
}
