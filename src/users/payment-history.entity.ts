import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('payment_history')
export class PaymentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ type: 'decimal' })
  amount: number;

  @CreateDateColumn()
  ts: Date;

  @ManyToOne(() => User, (user) => user.history)
  user: User;
}
