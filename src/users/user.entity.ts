import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { PaymentHistory } from './payment-history.entity';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'decimal', default: 0 })
  balance: number;

  @OneToMany(() => PaymentHistory, (ph) => ph.user)
  history: PaymentHistory[];
}
