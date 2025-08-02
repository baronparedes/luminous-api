/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';
import Profile from './profile-model';

interface SequelizeOptions {
  userId?: number;
  [key: string]: unknown;
}

// Base model with audit fields for tracking who created/updated records
export abstract class BaseModelWithAudit extends Model {
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @AllowNull(true)
  @ForeignKey(() => Profile)
  @Column
  createdBy?: number;

  @AllowNull(true)
  @ForeignKey(() => Profile)
  @Column
  updatedBy?: number;

  // Global hooks for automatic audit field population
  @BeforeCreate
  static setCreatedBy(instance: BaseModelWithAudit, options: SequelizeOptions) {
    if (options?.userId) {
      instance.createdBy = options.userId;
      instance.updatedBy = options.userId;
    }
  }

  @BeforeUpdate
  static setUpdatedBy(instance: BaseModelWithAudit, options: SequelizeOptions) {
    if (options?.userId) {
      instance.updatedBy = options.userId;
    }
  }
}

export default BaseModelWithAudit;
