import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { PaymentHistory } from './payment-history.entity';
import { ChargeBalanceDto } from './dto/charge-balance.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(PaymentHistory)
    private readonly historyRepo: Repository<PaymentHistory>,
  ) {}

  async onModuleInit() {
    const existing = await this.usersRepo.findOne({ where: { id: 1 } });
    if (!existing) {
      const user = this.usersRepo.create({ id: 1, balance: 1000 });
      await this.usersRepo.save(user);
      this.logger.log('Seeded default user with id = 1 and balance = 1000');
    } else {
      this.logger.log('User with id = 1 already exists');
    }
  }

  async chargeUser(dto: ChargeBalanceDto) {
    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.balance < dto.amount)
      throw new BadRequestException('Insufficient funds');

    user.balance -= dto.amount;

    await this.usersRepo.save(user);

    const record = this.historyRepo.create({
      user,
      action: dto.action,
      amount: -dto.amount,
    });
    await this.historyRepo.save(record);

    return { balance: user.balance };
  }
}
