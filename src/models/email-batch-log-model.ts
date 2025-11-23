import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  NotEmpty,
  Table,
} from 'sequelize-typescript';

import {
  EmailBatchAttr,
  EmailBatchLogAttr,
  EmailBatchLogStatus,
} from '../@types/models';
import Property from './property-model';
import EmailBatch from './email-batch-model';

@Table
class EmailBatchLog extends Model implements EmailBatchLogAttr {
  @AllowNull(false)
  @ForeignKey(() => EmailBatch)
  @Column
  batchId!: number;

  @AllowNull(false)
  @ForeignKey(() => Property)
  @Column
  propertyId!: number;

  @AllowNull(false)
  @NotEmpty
  @Column
  email!: string;

  @AllowNull(false)
  @Column
  status!: EmailBatchLogStatus;

  @AllowNull(true)
  @Column
  errorMessage?: string;

  @AllowNull(true)
  @Column
  sentAt?: Date;

  @BelongsTo(() => EmailBatch)
  batch?: EmailBatchAttr;

  @BelongsTo(() => Property)
  property?: Property;
}

export default EmailBatchLog;
