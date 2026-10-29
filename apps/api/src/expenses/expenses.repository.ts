import { Injectable } from '@nestjs/common';
import { Prisma, SplitType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ExpenseWriteModel {
  groupId: string;
  description: string;
  amountMinor: number;
  currencyCode: string;
  date: Date;
  category: string;
  payerId: string;
  splitType: SplitType;
  notes: string | null;
  splits: { memberId: string; shareMinor: number }[];
}

const expenseInclude = {
  splits: { select: { memberId: true, shareMinor: true } },
} satisfies Prisma.ExpenseInclude;

@Injectable()
export class ExpensesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an expense and its split rows atomically. The whole write is wrapped
   * in a transaction so an expense can never be persisted without its complete,
   * balanced set of splits (and vice versa).
   */
  createWithSplits(model: ExpenseWriteModel) {
    return this.prisma.$transaction(async (tx) => {
      return tx.expense.create({
        data: {
          groupId: model.groupId,
          description: model.description,
          amountMinor: model.amountMinor,
          currencyCode: model.currencyCode,
          date: model.date,
          category: model.category,
          payerId: model.payerId,
          splitType: model.splitType,
          notes: model.notes,
          splits: {
            create: model.splits.map((s) => ({
              memberId: s.memberId,
              shareMinor: s.shareMinor,
            })),
          },
        },
        include: expenseInclude,
      });
    });
  }

  /**
   * Replace an expense and its splits atomically: delete old split rows and
   * recreate them inside the same transaction as the field update, so splits
   * always match the expense's current amount and participants.
   */
  updateWithSplits(id: string, model: ExpenseWriteModel) {
    return this.prisma.$transaction(async (tx) => {
      await tx.expenseSplit.deleteMany({ where: { expenseId: id } });
      return tx.expense.update({
        where: { id },
        data: {
          description: model.description,
          amountMinor: model.amountMinor,
          currencyCode: model.currencyCode,
          date: model.date,
          category: model.category,
          payerId: model.payerId,
          splitType: model.splitType,
          notes: model.notes,
          splits: {
            create: model.splits.map((s) => ({
              memberId: s.memberId,
              shareMinor: s.shareMinor,
            })),
          },
        },
        include: expenseInclude,
      });
    });
  }

  findByGroup(groupId: string, where: Prisma.ExpenseWhereInput) {
    return this.prisma.expense.findMany({
      where: { groupId, ...where },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: expenseInclude,
    });
  }

  findOne(groupId: string, id: string) {
    return this.prisma.expense.findFirst({
      where: { id, groupId },
      include: expenseInclude,
    });
  }

  delete(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}
