import { OperationType } from "./CreateStatementController";

interface ICreateStatementDTO {
  user_id: string;
  sender_id?: string;
  description: string;
  amount: number;
  type: OperationType;
}

export { ICreateStatementDTO };
