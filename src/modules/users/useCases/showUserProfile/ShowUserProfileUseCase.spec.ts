import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("Should be able to return an user profile", async () => {
    const user: ICreateUserDTO = {
      name: "Test User",
      email: "test@mail.com",
      password: "1234",
    };

    const userCreated = await createUserUseCase.execute(user);
    const user_id = <string>userCreated.id;

    const userFound = await showUserProfileUseCase.execute(user_id);

    expect(userFound).toHaveProperty("name", user.name);
    expect(userFound).toHaveProperty("email", user.email);
  });

  it("Should not be able to return a non existent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("fake_id");
    }).rejects.toBeInstanceOf(AppError);
  });
});
