import { Statement } from "../entities/Statement";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export class BalanceMap {
  static toDTO({
    statement,
    balance,
  }: {
    statement: Statement[];
    balance: number;
  }) {
    const map1 = statement
      .filter((statement) => statement.sender_id === null)
      .map(({ id, amount, description, type, created_at, updated_at }) => ({
        id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at,
      }));

    const map2 = statement
      .filter((statement) => statement.sender_id !== null)
      .map(
        ({
          id,
          sender_id,
          amount,
          description,
          type,
          created_at,
          updated_at,
        }) => ({
          id,
          sender_id,
          amount: Number(amount),
          description,
          type,
          created_at,
          updated_at,
        })
      );

    const parsedStatement = map1.concat(map2).sort(function (a, b) {
      return (
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      );
    });

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
