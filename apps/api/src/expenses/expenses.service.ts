import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SplitService } from '../domain/split/split.service';
import { majorToMinor } from '../domain/money';
import { ExpenseView } from '../common/view-models';
import { GroupsRepository } from '../groups/groups.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { ExpensesRepository, ExpenseWriteModel } from './expenses.repository';

type ExpenseRow = {
  id: string;
  groupId: string;
  description: string;
  amountMinor: number;
  currencyCode: string;
  date: Date;
  category: string;
  payerId: string;
  splitType: 'EQUAL';
  notes: string | null;
  createdAt: Date;
  splits: { memberId: string; shareMinor: number }[];
};

function toExpenseView(expense: ExpenseRow): ExpenseView {
  return {
    id: expense.id,
    groupId: expense.groupId,
    description: expense.description,
    amountMinor: expense.amountMinor,
    currencyCode: expense.currencyCode,
    date: expense.date.toISOString(),
    category: expense.category,
    payerId: expense.payerId,
    splitType: 'EQUAL',
    notes: expense.notes,
    createdAt: expense.createdAt.toISOString(),
    splits: expense.splits.map((s) => ({
      memberId: s.memberId,
      shareMinor: s.shareMinor,
    })),
    participantIds: expense.splits.map((s) => s.memberId),
  };
}

@Injectable()
export class ExpensesService {
  constructor(
    private readonly repo: ExpensesRepository,
    private readonly groups: GroupsRepository,
    private readonly split: SplitService,
  ) {}

  async create(groupId: string, dto: CreateExpenseDto): Promise<ExpenseView> {
    const group = await this.loadGroup(groupId);
    const memberIds = new Set(group.members.map((m) => m.id));

    this.assertPayer(dto.payerId, memberIds);
    this.assertParticipants(dto.participantIds, memberIds);

    const amountMinor = this.convertAmount(dto.amount, group.currencyCode);
    const splits = this.split.allocateEqual({
      totalMinor: amountMinor,
      participantIds: dto.participantIds,
      payerId: dto.payerId,
    });

    const model: ExpenseWriteModel = {
      groupId,
      description: dto.description,
      amountMinor,
      currencyCode: group.currencyCode,
      date: new Date(dto.date),
      category: dto.category,
      payerId: dto.payerId,
      splitType: 'EQUAL',
      notes: dto.notes ?? null,
      splits,
    };

    const created = (await this.repo.createWithSplits(model)) as ExpenseRow;
    return toExpenseView(created);
  }

  async findAll(
    groupId: string,
    query: QueryExpensesDto,
  ): Promise<ExpenseView[]> {
    await this.loadGroup(groupId);
    const where = this.buildWhere(query);
    const expenses = (await this.repo.findByGroup(groupId, where)) as ExpenseRow[];
    return expenses.map(toExpenseView);
  }

  async findOne(groupId: string, id: string): Promise<ExpenseView> {
    const expense = (await this.repo.findOne(groupId, id)) as ExpenseRow | null;
    if (!expense) {
      throw new NotFoundException(`Expense ${id} not found in group ${groupId}`);
    }
    return toExpenseView(expense);
  }

  async update(
    groupId: string,
    id: string,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseView> {
    const group = await this.loadGroup(groupId);
    const existing = (await this.repo.findOne(groupId, id)) as ExpenseRow | null;
    if (!existing) {
      throw new NotFoundException(`Expense ${id} not found in group ${groupId}`);
    }
    const memberIds = new Set(group.members.map((m) => m.id));

    const payerId = dto.payerId ?? existing.payerId;
    const participantIds =
      dto.participantIds ?? existing.splits.map((s) => s.memberId);

    this.assertPayer(payerId, memberIds);
    this.assertParticipants(participantIds, memberIds);

    const amountMinor =
      dto.amount !== undefined
        ? this.convertAmount(dto.amount, group.currencyCode)
        : existing.amountMinor;

    const splits = this.split.allocateEqual({
      totalMinor: amountMinor,
      participantIds,
      payerId,
    });

    const model: ExpenseWriteModel = {
      groupId,
      description: dto.description ?? existing.description,
      amountMinor,
      currencyCode: group.currencyCode,
      date: dto.date ? new Date(dto.date) : existing.date,
      category: dto.category ?? existing.category,
      payerId,
      splitType: 'EQUAL',
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
      splits,
    };

    const updated = (await this.repo.updateWithSplits(id, model)) as ExpenseRow;
    return toExpenseView(updated);
  }

  async remove(groupId: string, id: string): Promise<void> {
    const existing = await this.repo.findOne(groupId, id);
    if (!existing) {
      throw new NotFoundException(`Expense ${id} not found in group ${groupId}`);
    }
    await this.repo.delete(id);
  }

  // --- helpers ---

  private async loadGroup(groupId: string) {
    const group = await this.groups.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
    return group;
  }

  private convertAmount(amount: string, currencyCode: string): number {
    let minor: number;
    try {
      minor = majorToMinor(amount, currencyCode);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid amount',
      );
    }
    if (minor <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
    return minor;
  }

  private assertPayer(payerId: string, memberIds: Set<string>): void {
    if (!memberIds.has(payerId)) {
      throw new BadRequestException('payerId must be a member of the group');
    }
  }

  private assertParticipants(
    participantIds: string[],
    memberIds: Set<string>,
  ): void {
    if (participantIds.length === 0) {
      throw new BadRequestException('Select at least one participant');
    }
    if (new Set(participantIds).size !== participantIds.length) {
      throw new BadRequestException('Participant ids must be unique');
    }
    for (const id of participantIds) {
      if (!memberIds.has(id)) {
        throw new BadRequestException(
          `Participant ${id} is not a member of the group`,
        );
      }
    }
  }

  private buildWhere(query: QueryExpensesDto): Prisma.ExpenseWhereInput {
    const where: Prisma.ExpenseWhereInput = {};
    if (query.category) {
      where.category = query.category;
    }
    if (query.payerId) {
      where.payerId = query.payerId;
    }
    if (query.from || query.to) {
      where.date = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }
    return where;
  }
}
