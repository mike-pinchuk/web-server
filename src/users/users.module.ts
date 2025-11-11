import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { PaymentHistory } from './payment-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PaymentHistory])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
