import { ConflictException, NotFoundException } from '@nestjs/common';
import { BalanceService } from '../domain/balance/balance.service';
import { GroupsService } from './groups.service';

function buildService() {
  const repo = {
    createGroupWithMembers: jest.fn(),
    findAllWithCounts: jest.fn(),
    findDetail: jest.fn(),
    findById: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(() => Promise.resolve()),
    countExpenses: jest.fn(),
    addMember: jest.fn(),
    findMember: jest.fn(),
    updateMember: jest.fn(),
    deleteMember: jest.fn(() => Promise.resolve()),
    countMemberReferences: jest.fn(),
  };
  const service = new GroupsService(repo as never, new BalanceService());
  return { service, repo };
}

describe('GroupsService.create', () => {
  it('creates a group with members and zeroed balances', async () => {
    const { service, repo } = buildService();
    repo.createGroupWithMembers.mockResolvedValueOnce({
      id: 'grp_1',
      name: 'Trip',
      description: 'A trip',
      currencyCode: 'USD',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      members: [
        {
          id: 'm1',
          name: 'Alex',
          email: 'alex@example.com',
          avatarColor: '#6366F1',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
        {
          id: 'm2',
          name: 'Dev',
          email: null,
          avatarColor: '#F59E0B',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ],
    });

    const result = await service.create({
      name: 'Trip',
      description: 'A trip',
      currencyCode: 'USD',
      members: [{ name: 'Alex', email: 'alex@example.com' }, { name: 'Dev' }],
    });

    expect(result.members).toHaveLength(2);
    expect(result.members[0].hasAccount).toBe(true);
    expect(result.members[1].hasAccount).toBe(false); // name-only member
    expect(result.balances.every((b) => b.netMinor === 0)).toBe(true);
    expect(result.totals).toEqual({ expenseCount: 0, totalSpentMinor: 0 });
  });
});

describe('GroupsService.findOne', () => {
  it('derives balances that sum to zero from persisted expenses', async () => {
    const { service, repo } = buildService();
    repo.findDetail.mockResolvedValueOnce({
      id: 'grp_1',
      name: 'Trip',
      description: '',
      currencyCode: 'USD',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      members: [
        { id: 'a', name: 'A', email: null, avatarColor: '#111', createdAt: new Date() },
        { id: 'b', name: 'B', email: null, avatarColor: '#222', createdAt: new Date() },
      ],
      expenses: [
        {
          amountMinor: 5000,
          payerId: 'a',
          splits: [
            { memberId: 'a', shareMinor: 2500 },
            { memberId: 'b', shareMinor: 2500 },
          ],
        },
      ],
    });

    const result = await service.findOne('grp_1');
    const sum = result.balances.reduce((acc, b) => acc + b.netMinor, 0);
    expect(sum).toBe(0);
    const byId = Object.fromEntries(result.balances.map((b) => [b.memberId, b.netMinor]));
    expect(byId.a).toBe(2500);
    expect(byId.b).toBe(-2500);
    expect(result.totals).toEqual({ expenseCount: 1, totalSpentMinor: 5000 });
  });

  it('throws NotFound for a missing group', async () => {
    const { service, repo } = buildService();
    repo.findDetail.mockResolvedValueOnce(null);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('GroupsService.remove', () => {
  it('refuses to delete a group that still has expenses', async () => {
    const { service, repo } = buildService();
    repo.findById.mockResolvedValueOnce({ id: 'grp_1', members: [] });
    repo.countExpenses.mockResolvedValueOnce(3);
    await expect(service.remove('grp_1')).rejects.toBeInstanceOf(ConflictException);
    expect(repo.deleteGroup).not.toHaveBeenCalled();
  });

  it('deletes an empty group', async () => {
    const { service, repo } = buildService();
    repo.findById.mockResolvedValueOnce({ id: 'grp_1', members: [] });
    repo.countExpenses.mockResolvedValueOnce(0);
    await service.remove('grp_1');
    expect(repo.deleteGroup).toHaveBeenCalledWith('grp_1');
  });
});

describe('GroupsService.removeMember', () => {
  it('refuses to remove a member referenced by expenses', async () => {
    const { service, repo } = buildService();
    repo.findMember.mockResolvedValueOnce({ id: 'm1', groupId: 'grp_1' });
    repo.countMemberReferences.mockResolvedValueOnce(2);
    await expect(service.removeMember('grp_1', 'm1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repo.deleteMember).not.toHaveBeenCalled();
  });

  it('removes a member with no references (zero balance)', async () => {
    const { service, repo } = buildService();
    repo.findMember.mockResolvedValueOnce({ id: 'm1', groupId: 'grp_1' });
    repo.countMemberReferences.mockResolvedValueOnce(0);
    await service.removeMember('grp_1', 'm1');
    expect(repo.deleteMember).toHaveBeenCalledWith('m1');
  });
});
