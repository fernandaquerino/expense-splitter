/**
 * Palette for member avatar circles. The cool, near-monochrome UI lets member
 * colors be the one place color pops (per the brand kit), so these are vivid
 * and visually distinct. Used when a member is created without an explicit
 * color.
 */
export const AVATAR_COLORS = [
  '#6366F1', // indigo
  '#F59E0B', // amber
  '#EC4899', // pink
  '#14B8A6', // teal
  '#8B5CF6', // violet
  '#10B981', // emerald
  '#F97316', // orange
  '#3B82F6', // blue
  '#EF4444', // red
  '#06B6D4', // cyan
] as const;

/** Pick a deterministic color based on how many members already exist. */
export function nextAvatarColor(existingCount: number): string {
  return AVATAR_COLORS[existingCount % AVATAR_COLORS.length];
}
