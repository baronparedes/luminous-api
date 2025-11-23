import {
  AllowNull,
  Column,
  DataType,
  HasMany,
  Model,
  NotEmpty,
  Table,
} from 'sequelize-typescript';

import {
  EmailBatchAttr,
  EmailBatchLogAttr,
  EmailBatchStatus,
  Month,
} from '../@types/models';
import EmailBatchLog from './email-batch-log-model';

@Table
class EmailBatch extends Model implements EmailBatchAttr {
  @AllowNull(false)
  @NotEmpty
  @Column
  batchName!: string;

  @AllowNull(false)
  @Column
  periodYear!: number;

  @AllowNull(false)
  @Column(DataType.CHAR(3))
  periodMonth!: Month;

  @AllowNull(false)
  @Column
  totalProperties!: number;

  @AllowNull(false)
  @Column({defaultValue: 0})
  sentCount!: number;

  @AllowNull(false)
  @Column({defaultValue: 0})
  failedCount!: number;

  @AllowNull(false)
  @Column({defaultValue: 'pending'})
  status!: EmailBatchStatus;

  @AllowNull(true)
  @Column
  startedAt?: Date;

  @AllowNull(true)
  @Column
  completedAt?: Date;

  @HasMany(() => EmailBatchLog)
  logs?: EmailBatchLogAttr[];
}

export default EmailBatch;
