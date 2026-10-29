import { Injectable } from '@nestjs/common';
import { AllocatedShare, EqualSplitInput } from './split.types';

/**
 * Pure equal-split allocation.
 *
 * Divides `totalMinor` as evenly as possible among the participants in integer
 * minor units, then distributes the leftover minor units deterministically:
 *
 *   base      = floor(total / N)
 *   remainder = total - base * N        (0 .. N-1)
 *
 * The first `remainder` participants each receive one extra minor unit. The
 * ordering puts the payer first (when they participate), so the payer absorbs
 * the leftover cent(s) — a stable, documented rule. The returned shares always
 * sum exactly to `totalMinor`, so no rounding error ever reaches the balances.
 *
 * Exported as a standalone function (easy to unit-test) and wrapped by
 * {@link SplitService} for dependency injection.
 */
export function allocateEqualSplit(input: EqualSplitInput): AllocatedShare[] {
  const { totalMinor, participantIds, payerId } = input;

  if (!Number.isInteger(totalMinor)) {
    throw new Error(`totalMinor must be an integer, got ${totalMinor}`);
  }
  if (totalMinor < 0) {
    throw new Error(`totalMinor must be non-negative, got ${totalMinor}`);
  }
  if (participantIds.length === 0) {
    throw new Error('An expense must have at least one participant');
  }
  const unique = new Set(participantIds);
  if (unique.size !== participantIds.length) {
    throw new Error('Participant ids must be unique');
  }

  const n = participantIds.length;
  const base = Math.floor(totalMinor / n);
  const remainder = totalMinor - base * n;

  // Priority order for leftover units: payer first (if participating), then
  // the remaining participants in their given order. This is stable for a
  // fixed input, which keeps allocations reproducible across recalculations.
  const priority = [...participantIds].sort((a, b) => {
    if (a === b) return 0;
    if (a === payerId) return -1;
    if (b === payerId) return 1;
    return participantIds.indexOf(a) - participantIds.indexOf(b);
  });

  const extraUnitRecipients = new Set(priority.slice(0, remainder));

  return participantIds.map((memberId) => ({
    memberId,
    shareMinor: base + (extraUnitRecipients.has(memberId) ? 1 : 0),
  }));
}

@Injectable()
export class SplitService {
  allocateEqual(input: EqualSplitInput): AllocatedShare[] {
    return allocateEqualSplit(input);
  }
}
