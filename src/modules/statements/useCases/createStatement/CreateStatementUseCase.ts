import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    sender_id,
    type,
    amount,
    description,
  }: ICreateStatementDTO): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);

    const sender_user = await this.usersRepository.findById(<string>sender_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === "withdraw") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    } else if (type === "transfer") {
      if (!sender_user) {
        throw new CreateStatementError.UserNotFound();
      }

      const { balance } = await this.statementsRepository.getUserBalance({
        user_id: <string>sender_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    return statementOperation;
  }
}
