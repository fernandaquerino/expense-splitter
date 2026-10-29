import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BalanceService } from '../domain/balance/balance.service';
import { nextAvatarColor } from '../common/avatar-colors';
import {
  GroupDetailView,
  GroupListItemView,
  MemberView,
} from '../common/view-models';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { GroupsRepository } from './groups.repository';

type MemberRow = {
  id: string;
  name: string;
  email: string | null;
  avatarColor: string;
  createdAt: Date;
};

function toMemberView(member: MemberRow): MemberView {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    avatarColor: member.avatarColor,
    hasAccount: member.email !== null && member.email !== '',
    createdAt: member.createdAt.toISOString(),
  };
}

@Injectable()
export class GroupsService {
  constructor(
    private readonly repo: GroupsRepository,
    private readonly balance: BalanceService,
  ) {}

  async create(dto: CreateGroupDto): Promise<GroupDetailView> {
    const members = (dto.members ?? []).map((m, index) => ({
      name: m.name,
      email: m.email ?? null,
      avatarColor: m.avatarColor ?? nextAvatarColor(index),
    }));

    const group = await this.repo.createGroupWithMembers({
      name: dto.name,
      description: dto.description ?? '',
      currencyCode: dto.currencyCode,
      members,
    });

    // Freshly created groups have no expenses yet.
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      currencyCode: group.currencyCode,
      createdAt: group.createdAt.toISOString(),
      members: group.members.map(toMemberView),
      totals: { expenseCount: 0, totalSpentMinor: 0 },
      balances: group.members.map((m) => ({
        memberId: m.id,
        paidMinor: 0,
        owedMinor: 0,
        netMinor: 0,
      })),
    };
  }

  async findAll(): Promise<GroupListItemView[]> {
    const groups = await this.repo.findAllWithCounts();
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      currencyCode: g.currencyCode,
      createdAt: g.createdAt.toISOString(),
      memberCount: g._count.members,
      expenseCount: g._count.expenses,
      totalSpentMinor: g.expenses.reduce((sum, e) => sum + e.amountMinor, 0),
    }));
  }

  async findOne(id: string): Promise<GroupDetailView> {
    const group = await this.repo.findDetail(id);
    if (!group) {
      throw new NotFoundException(`Group ${id} not found`);
    }

    const memberIds = group.members.map((m) => m.id);
    const balances = this.balance.memberBalances(memberIds, group.expenses);
    const totals = this.balance.groupTotals(group.expenses);

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      currencyCode: group.currencyCode,
      createdAt: group.createdAt.toISOString(),
      members: group.members.map(toMemberView),
      totals,
      balances,
    };
  }

  async update(id: string, dto: UpdateGroupDto): Promise<GroupDetailView> {
    await this.ensureExists(id);
    await this.repo.updateGroup(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.currencyCode !== undefined
        ? { currencyCode: dto.currencyCode }
        : {}),
    });
    return this.findOne(id);
  }

  /**
   * Delete a group. Settlements are deferred in the MVP, so "all debts settled"
   * cannot yet be expressed; we therefore only permit deleting an *empty* group
   * (no expenses) rather than silently deleting outstanding balances.
   */
  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    const expenseCount = await this.repo.countExpenses(id);
    if (expenseCount > 0) {
      throw new ConflictException(
        'A group with expenses cannot be deleted in this version. Delete its expenses first.',
      );
    }
    await this.repo.deleteGroup(id);
  }

  // --- members ---

  async addMember(groupId: string, dto: CreateMemberDto): Promise<MemberView> {
    const group = await this.repo.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
    const member = await this.repo.addMember(groupId, {
      name: dto.name,
      email: dto.email ?? null,
      avatarColor: dto.avatarColor ?? nextAvatarColor(group.members.length),
    });
    return toMemberView(member);
  }

  async updateMember(
    groupId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<MemberView> {
    await this.ensureMemberExists(groupId, memberId);
    const member = await this.repo.updateMember(memberId, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.avatarColor !== undefined ? { avatarColor: dto.avatarColor } : {}),
    });
    return toMemberView(member);
  }

  /**
   * Remove a member. Only permitted when the member has a zero balance, which
   * we enforce conservatively: a member referenced by any expense (as payer or
   * split participant) cannot be removed. That both guarantees a zero balance
   * and protects referential integrity.
   */
  async removeMember(groupId: string, memberId: string): Promise<void> {
    await this.ensureMemberExists(groupId, memberId);
    const references = await this.repo.countMemberReferences(memberId);
    if (references > 0) {
      throw new ConflictException(
        'This member is part of existing expenses and cannot be removed. Remove or reassign those expenses first.',
      );
    }
    await this.repo.deleteMember(memberId);
  }

  private async ensureExists(id: string): Promise<void> {
    const group = await this.repo.findById(id);
    if (!group) {
      throw new NotFoundException(`Group ${id} not found`);
    }
  }

  private async ensureMemberExists(
    groupId: string,
    memberId: string,
  ): Promise<void> {
    const member = await this.repo.findMember(groupId, memberId);
    if (!member) {
      throw new NotFoundException(
        `Member ${memberId} not found in group ${groupId}`,
      );
    }
  }
}
