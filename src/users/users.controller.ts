import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChargeBalanceDto } from './dto/charge-balance.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('charge')
  async chargeUser(@Body() dto: ChargeBalanceDto) {
    return this.usersService.chargeUser(dto);
  }
}
