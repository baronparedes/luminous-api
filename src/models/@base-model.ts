/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AllowNull,
  BeforeBulkCreate,
  BeforeBulkUpdate,
  BeforeCreate,
  BeforeUpdate,
  Column,
  CreatedAt,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';

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
  @Column
  createdBy?: number;

  @AllowNull(true)
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

  @BeforeBulkCreate
  static setBulkCreatedBy(
    instances: BaseModelWithAudit[],
    options: SequelizeOptions
  ) {
    if (options?.userId) {
      instances.forEach(instance => {
        instance.createdBy = options.userId;
        instance.updatedBy = options.userId;
      });
    }
  }

  @BeforeBulkUpdate
  static setBulkUpdatedBy(
    instances: BaseModelWithAudit[],
    options: SequelizeOptions
  ) {
    if (options?.userId) {
      instances.forEach(instance => {
        instance.updatedBy = options.userId;
      });
    }
  }
}

export default BaseModelWithAudit;
