import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from '../default.entity';
import { User } from './user';

@Entity()
export class Vendor extends DefaultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 300,
  })
  address: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 25,
  })
  phone: string | null | undefined;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
  })
  email: string | null | undefined;
}
