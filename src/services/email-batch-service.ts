import {Op} from 'sequelize';

import {EmailBatchAttr, Month, Period} from '../@types/models';
import {getCurrentMonthYear, toTransactionPeriod} from '../@utils/dates';
import EmailBatch from '../models/email-batch-model';
import EmailBatchLog from '../models/email-batch-log-model';
import Property from '../models/property-model';
import PropertyAssignment from '../models/property-assignment-model';
import Profile from '../models/profile-model';
import Transaction from '../models/transaction-model';
import NotificationService from './notification-service';

export default class EmailBatchService {
  private notificationService: NotificationService;

  constructor(communityId: number) {
    this.notificationService = new NotificationService(communityId);
  }

  public async createBatch(
    year?: number,
    month?: Month
  ): Promise<EmailBatchAttr> {
    const currentPeriod = getCurrentMonthYear();
    const period: Period = {
      year: year ?? currentPeriod.year,
      month: month ?? currentPeriod.month,
    };

    // Get all properties with assigned profiles that have emails
    try {
      // Get all property assignments with profiles that have emails
      const assignments = await PropertyAssignment.findAll({
        include: [
          {
            model: Profile,
            where: {
              email: {[Op.ne]: null},
            },
          },
          {
            model: Property,
          },
        ],
      });

      // Group assignments by property ID
      const propertyMap = new Map<number, PropertyAssignment[]>();
      for (const assignment of assignments) {
        const propertyId = assignment.propertyId;
        if (!propertyMap.has(propertyId)) {
          propertyMap.set(propertyId, []);
        }
        propertyMap.get(propertyId)!.push(assignment);
      }

      // Get unique property IDs that have at least one email
      const propertyIdsWithEmails = Array.from(propertyMap.keys());

      // Get property IDs that have transactions for the selected period
      const transactionPeriod = toTransactionPeriod(period.year, period.month);
      const transactionsInPeriod = await Transaction.findAll({
        where: {
          transactionPeriod,
          propertyId: {
            [Op.in]: propertyIdsWithEmails,
          },
        },
        attributes: ['propertyId'],
        group: ['propertyId'],
      });

      const propertyIdsWithTransactions = new Set(
        transactionsInPeriod.map(t => t.propertyId)
      );

      // Filter to only include properties with transactions in the period
      const eligiblePropertyIds = propertyIdsWithEmails.filter(id =>
        propertyIdsWithTransactions.has(id)
      );

      // Create batch
      const batch = await EmailBatch.create({
        batchName: `SOA ${period.month} ${period.year}`,
        periodYear: period.year,
        periodMonth: period.month,
        totalProperties: eligiblePropertyIds.length,
        sentCount: 0,
        failedCount: 0,
        status: 'pending',
      });

      // Create batch logs for each eligible property
      const logs = eligiblePropertyIds.map(propertyId => {
        const propertyAssignments = propertyMap.get(propertyId) || [];
        // Combine all emails from assignments with semicolon separator
        const emails = propertyAssignments
          .map(a => a.profile?.email)
          .filter(email => email)
          .join(';');
        return {
          batchId: batch.id,
          propertyId: propertyId,
          email: emails,
          status: 'skipped' as const,
        };
      });

      await EmailBatchLog.bulkCreate(logs);
      return this.getBatch(batch.id);
    } catch (error) {
      console.error('Error syncing PropertyAssignment model:', error);
      throw error;
    }
  }

  public async getBatch(batchId: number): Promise<EmailBatchAttr> {
    const batch = await EmailBatch.findByPk(batchId, {
      include: [
        {
          model: EmailBatchLog,
          as: 'logs',
          include: [
            {
              model: Property,
              as: 'property',
            },
          ],
        },
      ],
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    return batch.toJSON() as EmailBatchAttr;
  }

  public async getAllBatches(): Promise<EmailBatchAttr[]> {
    const batches = await EmailBatch.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: EmailBatchLog,
          as: 'logs',
        },
      ],
    });

    return batches.map(b => b.toJSON() as EmailBatchAttr);
  }

  public async processBatch(
    batchId: number,
    limit: number
  ): Promise<{
    processed: number;
    sent: number;
    failed: number;
    remaining: number;
  }> {
    const batch = await EmailBatch.findByPk(batchId);
    if (!batch) {
      console.error(`[EmailBatch] Batch not found: ${batchId}`);
      throw new Error('Batch not found');
    }

    if (batch.status === 'completed') {
      throw new Error('Batch already completed');
    }

    if (batch.status === 'cancelled') {
      throw new Error('Batch was cancelled');
    }

    // Update status to in_progress
    if (batch.status === 'pending') {
      batch.status = 'in_progress';
      batch.startedAt = new Date();
      await batch.save();
    }

    // Get pending logs (skipped status)
    const pendingLogs = await EmailBatchLog.findAll({
      where: {
        batchId,
        status: 'skipped',
      },
      limit,
      order: [['id', 'ASC']],
    });

    let sent = 0;
    let failed = 0;

    // Process each log with delay
    for (const log of pendingLogs) {
      try {
        await this.notificationService.sendStatementEmail(
          log.propertyId,
          log.email,
          batch.periodYear,
          batch.periodMonth
        );

        log.status = 'sent';
        log.sentAt = new Date();
        await log.save();
        sent++;

        // Add delay between emails (1.5 seconds)
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        log.status = 'failed';
        log.errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        await log.save();
        failed++;

        console.error(
          `[EmailBatch] Failed to send email to ${log.email} (Property ${log.propertyId}):`,
          error
        );
      }
    }

    // Update batch counts
    batch.sentCount += sent;
    batch.failedCount += failed;

    // Check if batch is complete
    const remainingCount = await EmailBatchLog.count({
      where: {
        batchId,
        status: 'skipped',
      },
    });

    if (remainingCount === 0) {
      batch.status = 'completed';
      batch.completedAt = new Date();
    }

    await batch.save();

    return {
      processed: pendingLogs.length,
      sent,
      failed,
      remaining: remainingCount,
    };
  }

  public async retryFailed(batchId: number): Promise<{
    processed: number;
    sent: number;
    failed: number;
    remaining: number;
  }> {
    const batch = await EmailBatch.findByPk(batchId);
    if (!batch) {
      console.error(`[EmailBatch] Batch not found: ${batchId}`);
      throw new Error('Batch not found');
    }

    // Get failed logs
    const failedLogs = await EmailBatchLog.findAll({
      where: {
        batchId,
        status: 'failed',
      },
      order: [['id', 'ASC']],
    });

    let sent = 0;
    let failed = 0;

    // Retry each failed log
    for (const log of failedLogs) {
      try {
        await this.notificationService.sendStatementEmail(
          log.propertyId,
          log.email,
          batch.periodYear,
          batch.periodMonth
        );

        log.status = 'sent';
        log.sentAt = new Date();
        log.errorMessage = undefined;
        await log.save();
        sent++;

        // Add delay between emails
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        log.errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        await log.save();
        failed++;

        console.error(
          `[EmailBatch] Retry failed for ${log.email} (Property ${log.propertyId}):`,
          error
        );
      }
    }

    // Update batch counts
    batch.sentCount += sent;
    batch.failedCount = failed;

    // Check if batch is complete
    const remainingCount = await EmailBatchLog.count({
      where: {
        batchId,
        status: 'skipped',
      },
    });

    if (remainingCount === 0 && failed === 0) {
      batch.status = 'completed';
      batch.completedAt = new Date();
    }

    await batch.save();

    return {
      processed: failedLogs.length,
      sent,
      failed,
      remaining: remainingCount,
    };
  }

  public async cancelBatch(batchId: number): Promise<EmailBatchAttr> {
    const batch = await EmailBatch.findByPk(batchId);
    if (!batch) {
      console.error(`[EmailBatch] Batch not found: ${batchId}`);
      throw new Error('Batch not found');
    }

    if (batch.status === 'completed') {
      console.error(`[EmailBatch] Cannot cancel completed batch: ${batchId}`);
      throw new Error('Cannot cancel completed batch');
    }

    batch.status = 'cancelled';
    await batch.save();

    return this.getBatch(batchId);
  }

  public async deleteBatch(batchId: number): Promise<void> {
    const batch = await EmailBatch.findByPk(batchId);
    if (!batch) {
      console.error(`[EmailBatch] Batch not found: ${batchId}`);
      throw new Error('Batch not found');
    }

    // Delete logs first
    await EmailBatchLog.destroy({
      where: {batchId},
    });

    // Delete batch
    await batch.destroy();
  }
}
