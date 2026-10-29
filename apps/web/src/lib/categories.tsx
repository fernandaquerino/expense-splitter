import {
  Utensils,
  Car,
  BedDouble,
  Home,
  Film,
  ShoppingBag,
  Zap,
  Carrot,
  Tag,
  type LucideIcon,
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  'Food & Drink',
  'Transport',
  'Accommodation',
  'Housing',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Groceries',
  'Other',
] as const;

interface CategoryStyle {
  icon: LucideIcon;
  /** Dot/icon tint. */
  color: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Food & Drink': { icon: Utensils, color: '#F97316' },
  Transport: { icon: Car, color: '#3B82F6' },
  Accommodation: { icon: BedDouble, color: '#8B5CF6' },
  Housing: { icon: Home, color: '#14B8A6' },
  Entertainment: { icon: Film, color: '#EC4899' },
  Shopping: { icon: ShoppingBag, color: '#F59E0B' },
  Utilities: { icon: Zap, color: '#EAB308' },
  Groceries: { icon: Carrot, color: '#10B981' },
  Other: { icon: Tag, color: '#8B94A6' },
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other!;
}

/** Small category glyph used in expense rows and filters. */
export function CategoryIcon({
  category,
  size = 16,
}: {
  category: string;
  size?: number;
}) {
  const { icon: Icon, color } = categoryStyle(category);
  return <Icon size={size} color={color} strokeWidth={1.8} aria-hidden="true" />;
}
