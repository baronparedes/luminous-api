import {Sequelize} from 'sequelize-typescript';
import {
  BulkCreateOptions,
  CreateOptions,
  Model,
  ModelStatic,
  SaveOptions,
  UpdateOptions,
  WhereOptions,
} from 'sequelize';

import {UserContext} from '../context/user-context';
import sequelize from '../db';

interface SequelizeOptionsWithUserId {
  userId?: number;
  [key: string]: unknown;
}

/**
 * Base service class that provides audit field functionality for all models.
 *
 * SEQUELIZE TYPE EXPLANATION:
 *
 * Sequelize uses two main internal types for type safety:
 *
 * 1. T['_attributes'] - Full Model Data (what exists on model instances)
 *    Example for Setting model:
 *    {
 *      id: number;           // Auto-generated primary key
 *      key: string;          // Required field
 *      value: string;        // Required field
 *      communityId: number;  // Required field
 *      createdAt: Date;      // Auto-generated timestamp
 *      updatedAt: Date;      // Auto-generated timestamp
 *      createdBy?: number;   // Audit field (optional)
 *      updatedBy?: number;   // Audit field (optional)
 *    }
 *
 * 2. T['_creationAttributes'] - Creation Data (what you provide when creating)
 *    Example for Setting model:
 *    {
 *      key: string;          // Required
 *      value: string;        // Required
 *      communityId: number;  // Required
 *      // id: NOT needed - auto-generated
 *      // createdAt: NOT needed - auto-generated
 *      // updatedAt: NOT needed - auto-generated
 *      // createdBy: NOT needed - set by our hooks
 *      // updatedBy: NOT needed - set by our hooks
 *    }
 *
 * These types prevent runtime errors by ensuring:
 * - You can't set auto-generated fields during creation
 * - You can't forget required fields
 * - You get proper TypeScript autocomplete and validation
 */
export default abstract class BaseServiceWithAudit {
  protected repository: Sequelize;

  constructor(repository?: Sequelize) {
    if (repository) {
      this.repository = repository;
    } else {
      this.repository = sequelize;
    }
  }

  /**
   * Gets the current user from context and prepares options with userId for Sequelize operations
   */
  protected getAuditOptions(): SequelizeOptionsWithUserId {
    const currentUser = UserContext.getCurrentUser();
    return currentUser ? {userId: currentUser.id} : {};
  }

  /**
   * Helper method to create a record with audit fields
   *
   * @param model - The Sequelize model class (e.g., Setting)
   * @param data - Creation attributes (T['_creationAttributes'])
   *               Only includes fields needed for creation, excludes auto-generated fields
   * @param additionalOptions - Optional Sequelize create options
   * @returns Promise<T> - The created model instance with all fields populated
   *
   * Example:
   * await this.createWithAudit(Setting, {
   *   key: 'WATER_CHARGE_ID',    // ✅ Required field
   *   value: '5',                // ✅ Required field
   *   communityId: 1             // ✅ Required field
   *   // id: 123                 // ❌ TypeScript error - auto-generated
   *   // createdAt: new Date()   // ❌ TypeScript error - auto-generated
   * });
   */
  protected async createWithAudit<T extends Model>(
    model: ModelStatic<T>,
    data: T['_creationAttributes'],
    additionalOptions?: Partial<CreateOptions<T['_attributes']>>
  ): Promise<T> {
    try {
      const options = {...this.getAuditOptions(), ...additionalOptions};
      return await model.create(
        data,
        options as CreateOptions<T['_attributes']>
      );
    } catch (error) {
      console.error('Error in createWithAudit:', error);
      throw error;
    }
  }

  /**
   * Helper method to save an instance with audit fields
   *
   * @param instance - An existing model instance to save
   * @param additionalOptions - Optional Sequelize save options
   * @returns Promise<T> - The saved model instance
   *
   * Example:
   * const setting = await Setting.findByPk(1);
   * setting.value = 'new value';
   * await this.saveWithAudit(setting); // updatedBy automatically set
   */
  protected async saveWithAudit<T extends Model>(
    instance: T,
    additionalOptions?: Partial<SaveOptions<T['_attributes']>>
  ): Promise<T> {
    try {
      const options = {...this.getAuditOptions(), ...additionalOptions};
      return await instance.save(options as SaveOptions<T['_attributes']>);
    } catch (error) {
      console.error('Error in saveWithAudit:', error);
      throw error;
    }
  }

  /**
   * Helper method to update records with audit fields
   *
   * @param model - The Sequelize model class
   * @param data - Partial attributes (Partial<T['_attributes']>)
   *               Can include any subset of model fields for updating
   * @param whereCondition - Conditions for which records to update
   * @param additionalOptions - Optional Sequelize update options
   * @returns Promise<[affectedCount: number]> - Number of records updated
   *
   * Example:
   * await this.updateWithAudit(
   *   Setting,
   *   { value: 'updated value' },           // ✅ Any field can be updated
   *   { key: 'WATER_CHARGE_ID' },          // ✅ Where condition
   *   { validate: true }                   // ✅ Additional options
   * );
   */
  protected async updateWithAudit<T extends Model>(
    model: ModelStatic<T>,
    data: Partial<T['_attributes']>,
    whereCondition: WhereOptions<T['_attributes']>,
    additionalOptions?: Partial<UpdateOptions<T['_attributes']>>
  ): Promise<[affectedCount: number]> {
    try {
      const options = {
        where: whereCondition,
        ...this.getAuditOptions(),
        ...additionalOptions,
      };
      return await model.update(
        data,
        options as UpdateOptions<T['_attributes']>
      );
    } catch (error) {
      console.error('Error in updateWithAudit:', error);
      throw error;
    }
  }

  /**
   * Helper method for bulk operations with audit fields
   *
   * @param model - The Sequelize model class
   * @param data - Array of creation attributes (Array<T['_creationAttributes']>)
   *               Each object should only include fields needed for creation
   * @param additionalOptions - Optional Sequelize bulk create options
   * @returns Promise<T[]> - Array of created model instances
   *
   * Example:
   * await this.bulkCreateWithAudit(Category, [
   *   {
   *     communityId: 1,           // ✅ Required field
   *     description: 'Category 1', // ✅ Required field
   *     subCategories: 'Sub1,Sub2'  // ✅ Required field
   *   },
   *   // ... more categories
   * ], {
   *   updateOnDuplicate: ['description'] // ✅ Additional options
   * });
   */
  protected async bulkCreateWithAudit<T extends Model>(
    model: ModelStatic<T>,
    data: Array<T['_creationAttributes']>,
    additionalOptions?: Partial<BulkCreateOptions<T['_attributes']>>
  ): Promise<T[]> {
    try {
      const options = {...this.getAuditOptions(), ...additionalOptions};
      return await model.bulkCreate(
        data,
        options as BulkCreateOptions<T['_attributes']>
      );
    } catch (error) {
      console.error('Error in bulkCreateWithAudit:', error);
      throw error;
    }
  }
}
