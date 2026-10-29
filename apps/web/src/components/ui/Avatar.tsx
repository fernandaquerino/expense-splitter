import { initials } from '@/lib/format';

const SIZES = {
  sm: { box: 24, font: 10 },
  md: { box: 32, font: 12 },
  lg: { box: 40, font: 15 },
} as const;

/**
 * Member avatar: colored circle with initials. The name is communicated
 * separately in text, so the circle itself is decorative (aria-hidden).
 */
export function Avatar({
  name,
  color,
  size = 'md',
}: {
  name: string;
  color: string;
  size?: keyof typeof SIZES;
}) {
  const { box, font } = SIZES[size];
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: box,
        height: box,
        backgroundColor: color,
        fontSize: font,
        lineHeight: 1,
      }}
    >
      {initials(name)}
    </span>
  );
}
