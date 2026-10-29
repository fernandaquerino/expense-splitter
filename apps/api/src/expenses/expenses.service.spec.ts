import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SplitService } from '../domain/split/split.service';
import { ExpensesService } from './expenses.service';
import { ExpenseWriteModel } from './expenses.repository';

/**
 * Service-level (API endpoint logic) tests with mocked repositories. These
 * exercise validation, currency conversion, split allocation and the mapping
 * to the API view model without needing a database.
 */

const group = {
  id: 'grp_1',
  currencyCode: 'USD',
  members: [
    { id: 'a', name: 'Alice' },
    { id: 'b', name: 'Bob' },
    { id: 'c', name: 'Carol' },
  ],
};

function makeRow(model: ExpenseWriteModel) {
  return {
    id: 'exp_1',
    groupId: model.groupId,
    description: model.description,
    amountMinor: model.amountMinor,
    currencyCode: model.currencyCode,
    date: model.date,
    category: model.category,
    payerId: model.payerId,
    splitType: 'EQUAL' as const,
    notes: model.notes,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    splits: model.splits,
  };
}

function buildService() {
  const repo = {
    createWithSplits: jest.fn((model: ExpenseWriteModel) =>
      Promise.resolve(makeRow(model)),
    ),
    updateWithSplits: jest.fn((_id: string, model: ExpenseWriteModel) =>
      Promise.resolve(makeRow(model)),
    ),
    findByGroup: jest.fn(() => Promise.resolve([])),
    findOne: jest.fn(),
    delete: jest.fn(() => Promise.resolve()),
  };
  const groups = {
    findById: jest.fn(() => Promise.resolve(group)),
  };
  const service = new ExpensesService(
    repo as never,
    groups as never,
    new SplitService(),
  );
  return { service, repo, groups };
}

describe('ExpensesService.create', () => {
  const baseDto = {
    description: 'Dinner',
    amount: '90.00',
    date: '2024-01-02T19:00:00Z',
    category: 'Food & Drink',
    payerId: 'a',
    participantIds: ['a', 'b', 'c'],
  };

  it('converts the amount to minor units and allocates an equal split', async () => {
    const { service, repo } = buildService();
    const result = await service.create('grp_1', { ...baseDto });

    expect(repo.createWithSplits).toHaveBeenCalledTimes(1);
    const model = repo.createWithSplits.mock.calls[0][0] as ExpenseWriteModel;
    expect(model.amountMinor).toBe(9000);
    expect(model.currencyCode).toBe('USD');
    expect(model.splits.reduce((s, x) => s + x.shareMinor, 0)).toBe(9000);

    expect(result.amountMinor).toBe(9000);
    expect(result.splitType).toBe('EQUAL');
    expect(result.participantIds).toEqual(['a', 'b', 'c']);
  });

  it('gives the leftover cent to the payer for an uneven split', async () => {
    const { service } = buildService();
    const result = await service.create('grp_1', { ...baseDto, amount: '100.00' });
    // 10000 / 3 = 3334, 3333, 3333 with payer 'a' absorbing the extra cent.
    const byId = Object.fromEntries(
      result.splits.map((s) => [s.memberId, s.shareMinor]),
    );
    expect(byId.a).toBe(3334);
    expect(byId.b).toBe(3333);
    expect(byId.c).toBe(3333);
  });

  it('rejects a payer who is not a group member', async () => {
    const { service } = buildService();
    await expect(
      service.create('grp_1', { ...baseDto, payerId: 'zzz' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a participant who is not a group member', async () => {
    const { service } = buildService();
    await expect(
      service.create('grp_1', { ...baseDto, participantIds: ['a', 'zzz'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an amount with too many decimals for the currency', async () => {
    const { service } = buildService();
    await expect(
      service.create('grp_1', { ...baseDto, amount: '90.123' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a zero amount', async () => {
    const { service } = buildService();
    await expect(
      service.create('grp_1', { ...baseDto, amount: '0' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFound when the group does not exist', async () => {
    const { service, groups } = buildService();
    groups.findById.mockResolvedValueOnce(null as never);
    await expect(service.create('missing', { ...baseDto })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('ExpensesService.update', () => {
  it('recomputes splits when the amount changes', async () => {
    const { service, repo } = buildService();
    repo.findOne.mockResolvedValueOnce(
      makeRow({
        groupId: 'grp_1',
        description: 'Old',
        amountMinor: 9000,
        currencyCode: 'USD',
        date: new Date('2024-01-02T19:00:00Z'),
        category: 'Food & Drink',
        payerId: 'a',
        notes: null,
        splitType: 'EQUAL',
        splits: [
          { memberId: 'a', shareMinor: 3000 },
          { memberId: 'b', shareMinor: 3000 },
          { memberId: 'c', shareMinor: 3000 },
        ],
      }) as never,
    );

    const result = await service.update('grp_1', 'exp_1', { amount: '60.00' });
    expect(result.amountMinor).toBe(6000);
    expect(result.splits.reduce((s, x) => s + x.shareMinor, 0)).toBe(6000);
  });

  it('throws NotFound when the expense is missing', async () => {
    const { service, repo } = buildService();
    repo.findOne.mockResolvedValueOnce(null as never);
    await expect(
      service.update('grp_1', 'missing', { amount: '10.00' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('ExpensesService.findOne', () => {
  it('throws NotFound for an unknown expense', async () => {
    const { service, repo } = buildService();
    repo.findOne.mockResolvedValueOnce(null as never);
    await expect(service.findOne('grp_1', 'nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
