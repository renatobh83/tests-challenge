import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateTransferStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.params;
    const { id: sender_id } = request.user;

    const { amount, description } = request.body;

    const type = "transfer" as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    return response.status(201).json(statement);
  }
}

export { OperationType };
