/**
 * Client mirror of the API's equal-split allocator (apps/api/src/domain/split).
 * Kept byte-for-byte equivalent in behaviour so the live preview matches what
 * the server will persist: deterministic, payer-first leftover minor units,
 * shares summing exactly to the total.
 */
export interface AllocatedShare {
  memberId: string;
  shareMinor: number;
}

export function allocateEqualSplit(
  totalMinor: number,
  participantIds: string[],
  payerId: string,
): AllocatedShare[] {
  if (participantIds.length === 0) return [];
  const n = participantIds.length;
  const base = Math.floor(totalMinor / n);
  const remainder = totalMinor - base * n;

  const priority = [...participantIds].sort((a, b) => {
    if (a === b) return 0;
    if (a === payerId) return -1;
    if (b === payerId) return 1;
    return participantIds.indexOf(a) - participantIds.indexOf(b);
  });
  const extra = new Set(priority.slice(0, remainder));

  return participantIds.map((memberId) => ({
    memberId,
    shareMinor: base + (extra.has(memberId) ? 1 : 0),
  }));
}
