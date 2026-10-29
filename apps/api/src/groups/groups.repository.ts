import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Data-access for groups and their members. The repository owns all Prisma
 * calls; services contain orchestration and business rules, controllers only
 * HTTP concerns.
 */
@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createGroupWithMembers(data: {
    name: string;
    description: string;
    currencyCode: string;
    members: { name: string; email: string | null; avatarColor: string }[];
  }) {
    return this.prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        currencyCode: data.currencyCode,
        members: { create: data.members },
      },
      include: { members: { orderBy: { createdAt: 'asc' } } },
    });
  }

  /** Lightweight list with the aggregates the dashboard needs. */
  findAllWithCounts() {
    return this.prisma.group.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { members: true, expenses: true } },
        expenses: { select: { amountMinor: true } },
      },
    });
  }

  findDetail(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        members: { orderBy: { createdAt: 'asc' } },
        expenses: {
          select: {
            amountMinor: true,
            payerId: true,
            splits: { select: { memberId: true, shareMinor: true } },
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
      include: { members: { orderBy: { createdAt: 'asc' } } },
    });
  }

  updateGroup(id: string, data: Prisma.GroupUpdateInput) {
    return this.prisma.group.update({
      where: { id },
      data,
      include: { members: { orderBy: { createdAt: 'asc' } } },
    });
  }

  deleteGroup(id: string) {
    return this.prisma.group.delete({ where: { id } });
  }

  countExpenses(groupId: string) {
    return this.prisma.expense.count({ where: { groupId } });
  }

  // --- members ---

  addMember(
    groupId: string,
    data: { name: string; email: string | null; avatarColor: string },
  ) {
    return this.prisma.member.create({ data: { ...data, groupId } });
  }

  findMember(groupId: string, memberId: string) {
    return this.prisma.member.findFirst({ where: { id: memberId, groupId } });
  }

  updateMember(memberId: string, data: Prisma.MemberUpdateInput) {
    return this.prisma.member.update({ where: { id: memberId }, data });
  }

  deleteMember(memberId: string) {
    return this.prisma.member.delete({ where: { id: memberId } });
  }

  /** How many expenses reference this member as payer or split participant. */
  async countMemberReferences(memberId: string): Promise<number> {
    const [asPayer, asParticipant] = await Promise.all([
      this.prisma.expense.count({ where: { payerId: memberId } }),
      this.prisma.expenseSplit.count({ where: { memberId } }),
    ]);
    return asPayer + asParticipant;
  }
}
