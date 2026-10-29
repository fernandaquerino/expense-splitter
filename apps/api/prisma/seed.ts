/**
 * Guest-mode seed.
 *
 * Populates the database with realistic groups, members, and expenses for the
 * guest experience. The data is intentionally faithful to the MVP's scope:
 * EQUAL splits only, a single currency per group (no live conversion, no
 * settlements). Splits are generated with the same deterministic allocator the
 * API uses at runtime, so every expense's shares sum exactly to its amount and
 * balances are mathematically consistent.
 *
 * Member names, colors, group themes, and the name-only member (Dev Okafor)
 * are drawn from data/sample-groups.json so the guest data mirrors the
 * challenge's intent, while the amounts are expressed in the group's single
 * currency to stay within scope.
 */
import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { allocateEqualSplit } from '../src/domain/split/split.service';
import { majorToMinor } from '../src/domain/money';

const prisma = new PrismaClient();

interface SeedMember {
  key: string;
  name: string;
  email?: string;
  avatarColor: string;
}

interface SeedExpense {
  description: string;
  /** Major-unit amount as a string (whole numbers for JPY). */
  amount: string;
  date: string;
  category: string;
  payer: string; // member key
  participants?: string[]; // member keys; defaults to all members
  notes?: string;
}

interface SeedGroup {
  name: string;
  description: string;
  currencyCode: string;
  members: SeedMember[];
  expenses: SeedExpense[];
}

const groups: SeedGroup[] = [
  {
    name: 'Trip to Japan',
    description: 'Two weeks exploring Tokyo, Kyoto, and Osaka.',
    currencyCode: 'JPY',
    members: [
      { key: 'alex', name: 'Alex Chen', email: 'alex@example.com', avatarColor: '#6366F1' },
      { key: 'jordan', name: 'Jordan Park', email: 'jordan@example.com', avatarColor: '#F59E0B' },
      { key: 'sam', name: 'Sam Rivera', email: 'sam@example.com', avatarColor: '#EC4899' },
      { key: 'taylor', name: 'Taylor Kim', email: 'taylor@example.com', avatarColor: '#14B8A6' },
    ],
    expenses: [
      { description: 'Shinjuku hotel (3 nights)', amount: '84000', date: '2024-03-18T14:00:00Z', category: 'Accommodation', payer: 'alex' },
      { description: 'Sushi Dai at Tsukiji', amount: '32400', date: '2024-03-19T12:30:00Z', category: 'Food & Drink', payer: 'jordan' },
      { description: 'JR Pass (7 days)', amount: '118000', date: '2024-03-19T09:00:00Z', category: 'Transport', payer: 'sam' },
      { description: 'teamLab Planets tickets', amount: '15200', date: '2024-03-20T10:00:00Z', category: 'Entertainment', payer: 'taylor' },
      { description: 'Izakaya dinner, Shibuya', amount: '21600', date: '2024-03-20T20:00:00Z', category: 'Food & Drink', payer: 'alex', notes: 'Everyone shared plates.' },
      { description: 'Konbini snacks run', amount: '4850', date: '2024-03-21T08:15:00Z', category: 'Groceries', payer: 'jordan' },
      { description: 'Kyoto ryokan (2 nights)', amount: '96000', date: '2024-03-22T15:00:00Z', category: 'Accommodation', payer: 'sam' },
      { description: 'Fushimi Inari day trip', amount: '6400', date: '2024-03-23T09:30:00Z', category: 'Transport', payer: 'taylor' },
      { description: 'Osaka Castle entry', amount: '2400', date: '2024-03-24T11:00:00Z', category: 'Entertainment', payer: 'alex', participants: ['alex', 'jordan', 'sam'], notes: 'Taylor sat this one out.' },
      { description: 'Dotonbori street food', amount: '9800', date: '2024-03-24T19:00:00Z', category: 'Food & Drink', payer: 'jordan' },
      { description: 'Souvenirs at Don Quijote', amount: '13300', date: '2024-03-25T16:00:00Z', category: 'Shopping', payer: 'sam' },
      { description: 'Airport limousine bus', amount: '12800', date: '2024-03-26T07:00:00Z', category: 'Transport', payer: 'taylor' },
    ],
  },
  {
    name: 'Apartment 4B',
    description: 'Monthly household costs for the three of us.',
    currencyCode: 'USD',
    members: [
      { key: 'riley', name: 'Riley Morgan', email: 'riley@example.com', avatarColor: '#8B5CF6' },
      { key: 'casey', name: 'Casey Brooks', email: 'casey@example.com', avatarColor: '#10B981' },
      { key: 'drew', name: 'Drew Patel', email: 'drew@example.com', avatarColor: '#F97316' },
    ],
    expenses: [
      { description: 'February rent', amount: '3600.00', date: '2024-02-01T09:00:00Z', category: 'Housing', payer: 'riley' },
      { description: 'Internet (February)', amount: '70.00', date: '2024-02-03T09:00:00Z', category: 'Utilities', payer: 'casey' },
      { description: 'Electricity (February)', amount: '142.37', date: '2024-02-05T09:00:00Z', category: 'Utilities', payer: 'drew', notes: 'Three-way split with an odd cent.' },
      { description: 'Cleaning supplies', amount: '48.20', date: '2024-02-08T18:00:00Z', category: 'Shopping', payer: 'casey' },
      { description: 'Plumber visit', amount: '220.00', date: '2024-02-11T14:00:00Z', category: 'Housing', payer: 'riley' },
      { description: 'Groceries (shared staples)', amount: '96.54', date: '2024-02-14T19:00:00Z', category: 'Groceries', payer: 'drew' },
      { description: 'Netflix (February)', amount: '22.99', date: '2024-02-15T09:00:00Z', category: 'Entertainment', payer: 'riley' },
      { description: 'Water & trash', amount: '61.10', date: '2024-02-18T09:00:00Z', category: 'Utilities', payer: 'casey' },
      { description: 'Light bulbs & batteries', amount: '18.75', date: '2024-02-22T17:00:00Z', category: 'Shopping', payer: 'drew' },
    ],
  },
  {
    name: 'Office Lunch Crew',
    description: 'Weekly lunches and coffee runs.',
    currencyCode: 'USD',
    members: [
      { key: 'mia', name: 'Mia Torres', email: 'mia@example.com', avatarColor: '#3B82F6' },
      { key: 'noah', name: 'Noah Williams', email: 'noah@example.com', avatarColor: '#EF4444' },
      { key: 'priya', name: 'Priya Sharma', email: 'priya@example.com', avatarColor: '#06B6D4' },
      { key: 'ethan', name: 'Ethan Nakamura', email: 'ethan@example.com', avatarColor: '#F59E0B' },
    ],
    expenses: [
      { description: 'Taco Tuesday', amount: '48.00', date: '2024-04-02T12:30:00Z', category: 'Food & Drink', payer: 'mia' },
      { description: 'Sandwich shop', amount: '24.50', date: '2024-04-04T12:30:00Z', category: 'Food & Drink', payer: 'noah', participants: ['mia', 'noah', 'ethan'], notes: 'Priya was out sick.' },
      { description: 'Coffee run', amount: '17.20', date: '2024-04-05T09:30:00Z', category: 'Food & Drink', payer: 'priya' },
      { description: 'Pizza Friday', amount: '52.00', date: '2024-04-05T12:30:00Z', category: 'Food & Drink', payer: 'ethan' },
      { description: 'Ramen lunch', amount: '41.25', date: '2024-04-09T12:30:00Z', category: 'Food & Drink', payer: 'mia' },
      { description: 'Bagel breakfast', amount: '19.80', date: '2024-04-11T09:00:00Z', category: 'Food & Drink', payer: 'noah' },
      { description: 'Sushi lunch', amount: '63.40', date: '2024-04-12T12:30:00Z', category: 'Food & Drink', payer: 'priya' },
      { description: 'Afternoon coffee', amount: '15.60', date: '2024-04-12T15:00:00Z', category: 'Food & Drink', payer: 'ethan' },
    ],
  },
  {
    name: "Sarah's Birthday Present",
    description: 'Chipping in for the gift, dinner, and flowers.',
    currencyCode: 'USD',
    members: [
      { key: 'olivia', name: 'Olivia Hayes', email: 'olivia@example.com', avatarColor: '#EC4899' },
      { key: 'ben', name: 'Ben Gutierrez', email: 'ben@example.com', avatarColor: '#6366F1' },
      { key: 'chloe', name: 'Chloe Yun', email: 'chloe@example.com', avatarColor: '#14B8A6' },
      { key: 'marcus', name: 'Marcus Webb', email: 'marcus@example.com', avatarColor: '#F97316' },
    ],
    expenses: [
      { description: 'Group gift (headphones)', amount: '180.00', date: '2024-05-10T17:00:00Z', category: 'Shopping', payer: 'olivia' },
      { description: 'Dinner deposit', amount: '60.00', date: '2024-05-12T18:00:00Z', category: 'Food & Drink', payer: 'ben' },
      { description: 'Decorations', amount: '34.25', date: '2024-05-14T15:00:00Z', category: 'Shopping', payer: 'chloe' },
      { description: 'Flowers', amount: '28.74', date: '2024-05-15T10:00:00Z', category: 'Shopping', payer: 'marcus', participants: ['olivia', 'marcus'], notes: 'Just Olivia and Marcus.' },
    ],
  },
  {
    name: 'Camping Weekend',
    description: 'A weekend in the mountains.',
    currencyCode: 'USD',
    members: [
      { key: 'jake', name: 'Jake Foster', email: 'jake@example.com', avatarColor: '#10B981' },
      { key: 'lily', name: 'Lily Tran', email: 'lily@example.com', avatarColor: '#8B5CF6' },
      { key: 'omar', name: 'Omar Hassan', email: 'omar@example.com', avatarColor: '#3B82F6' },
      { key: 'rachel', name: 'Rachel Kim', email: 'rachel@example.com', avatarColor: '#EF4444' },
      { key: 'dev', name: 'Dev Okafor', avatarColor: '#F59E0B' }, // name-only member, no email
    ],
    expenses: [
      { description: 'Campsite booking (2 nights)', amount: '160.00', date: '2024-06-14T16:00:00Z', category: 'Accommodation', payer: 'jake' },
      { description: 'Firewood & propane', amount: '42.30', date: '2024-06-14T17:30:00Z', category: 'Other', payer: 'lily' },
      { description: 'Groceries for the trip', amount: '134.80', date: '2024-06-14T11:00:00Z', category: 'Groceries', payer: 'omar' },
      { description: 'Gas for the drive', amount: '88.00', date: '2024-06-14T08:00:00Z', category: 'Transport', payer: 'jake', participants: ['lily', 'omar', 'rachel', 'dev'], notes: 'Jake drove, so passengers split the gas.' },
      { description: 'Ice & drinks', amount: '34.99', date: '2024-06-15T09:00:00Z', category: 'Groceries', payer: 'rachel' },
      { description: 'National park entry', amount: '35.00', date: '2024-06-15T10:00:00Z', category: 'Entertainment', payer: 'dev' },
      { description: 'Marshmallows & snacks', amount: '21.45', date: '2024-06-15T20:00:00Z', category: 'Groceries', payer: 'lily' },
      { description: 'Lantern batteries', amount: '12.00', date: '2024-06-15T18:00:00Z', category: 'Shopping', payer: 'omar' },
    ],
  },
];

async function main(): Promise<void> {
  console.log('Clearing existing data...');
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.member.deleteMany();
  await prisma.group.deleteMany();

  for (const g of groups) {
    console.log(`Seeding group: ${g.name}`);
    const group = await prisma.group.create({
      data: {
        name: g.name,
        description: g.description,
        currencyCode: g.currencyCode,
        members: {
          create: g.members.map((m) => ({
            name: m.name,
            email: m.email ?? null,
            avatarColor: m.avatarColor,
          })),
        },
      },
      include: { members: true },
    });

    // Map seed member keys -> created member ids (match on name).
    const idByKey = new Map<string, string>();
    for (const m of g.members) {
      const created = group.members.find((cm) => cm.name === m.name);
      if (!created) throw new Error(`Member not created: ${m.name}`);
      idByKey.set(m.key, created.id);
    }

    for (const e of g.expenses) {
      const payerId = idByKey.get(e.payer);
      if (!payerId) throw new Error(`Unknown payer key: ${e.payer}`);
      const participantKeys = e.participants ?? g.members.map((m) => m.key);
      const participantIds = participantKeys.map((k) => {
        const id = idByKey.get(k);
        if (!id) throw new Error(`Unknown participant key: ${k}`);
        return id;
      });

      const amountMinor = majorToMinor(e.amount, g.currencyCode);
      const splits = allocateEqualSplit({
        totalMinor: amountMinor,
        participantIds,
        payerId,
      });

      await prisma.expense.create({
        data: {
          groupId: group.id,
          description: e.description,
          amountMinor,
          currencyCode: g.currencyCode,
          date: new Date(e.date),
          category: e.category,
          payerId,
          splitType: 'EQUAL',
          notes: e.notes ?? null,
          splits: { create: splits },
        },
      });
    }
  }

  const groupCount = await prisma.group.count();
  const expenseCount = await prisma.expense.count();
  console.log(`Done. Seeded ${groupCount} groups and ${expenseCount} expenses.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
