import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalancePanel } from './BalancePanel';
import type { GroupDetail } from '@/lib/types';

function group(overrides: Partial<GroupDetail> = {}): GroupDetail {
  return {
    id: 'g1',
    name: 'Trip',
    description: '',
    currencyCode: 'USD',
    createdAt: '2024-01-01T00:00:00Z',
    members: [
      { id: 'a', name: 'Alice', email: null, avatarColor: '#111', hasAccount: false, createdAt: '2024-01-01T00:00:00Z' },
      { id: 'b', name: 'Bob', email: 'bob@x.com', avatarColor: '#222', hasAccount: true, createdAt: '2024-01-01T00:00:00Z' },
    ],
    totals: { expenseCount: 1, totalSpentMinor: 5000 },
    balances: [
      { memberId: 'a', paidMinor: 5000, owedMinor: 2500, netMinor: 2500 },
      { memberId: 'b', paidMinor: 0, owedMinor: 2500, netMinor: -2500 },
    ],
    ...overrides,
  };
}

describe('BalancePanel', () => {
  it('shows totals and per-member balances with direction and amount', () => {
    render(<BalancePanel group={group()} />);
    expect(screen.getByText('Total spent')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    // Direction labels (text, not just color)
    expect(screen.getByText('gets back')).toBeInTheDocument();
    expect(screen.getByText('owes')).toBeInTheDocument();
    // Both members' amounts render (one owed, one owes).
    expect(screen.getAllByText(/\$25\.00/)).toHaveLength(2);
  });

  it('marks name-only members', () => {
    render(<BalancePanel group={group()} />);
    expect(screen.getByText('name only')).toBeInTheDocument();
  });

  it('celebrates the all-settled state', () => {
    render(
      <BalancePanel
        group={group({
          balances: [
            { memberId: 'a', paidMinor: 2500, owedMinor: 2500, netMinor: 0 },
            { memberId: 'b', paidMinor: 2500, owedMinor: 2500, netMinor: 0 },
          ],
        })}
      />,
    );
    expect(screen.getByText('All settled up!')).toBeInTheDocument();
  });
});
