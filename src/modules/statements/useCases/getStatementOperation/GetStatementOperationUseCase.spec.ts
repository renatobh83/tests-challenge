import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
    );
  });

  it("Should be able get an statement from an user account", async () => {
    const user: ICreateUserDTO = {
      name: "Test User",
      email: "test@mail.com",
      password: "1234",
    };

    const user_id = <string>(await createUserUseCase.execute(user)).id;

    const statement = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test",
    });

    const statement_id = <string>statement.id;

    const returnedStatement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(returnedStatement).toBeInstanceOf(Statement);
    expect(returnedStatement).toHaveProperty("id");
    expect(returnedStatement).toHaveProperty("type", "deposit");
    expect(returnedStatement).toHaveProperty("amount", 100);
  });

  it("Should not be able get an statement from an unexistent user account", async () => {
    expect(async () => {
      const user_id = "fake_user_id";

      const statement_id = "fake_statement_id";

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able get an unexistent statement", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Test User",
        email: "test@mail.com",
        password: "1234",
      };

      const user_id = <string>(await createUserUseCase.execute(user)).id;

      const statement_id = "fake_statement_id";

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
