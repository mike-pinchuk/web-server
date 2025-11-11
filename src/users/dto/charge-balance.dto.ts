import { IsInt, IsPositive, IsString } from 'class-validator';

export class ChargeBalanceDto {
  @IsInt()
  userId: number;

  @IsString()
  action: string;

  @IsPositive()
  amount: number;
}
