import {Sequelize} from 'sequelize-typescript';

import {Period} from '../../@types/models';
import {TransactionBreakdownView} from '../../@types/views';
import {toTransactionPeriod} from '../../@utils/dates';
import useSql from '../use-sql';

export default async function useTransactionBreakdown(
  propertyId: number,
  period: Period,
  db: Sequelize
) {
  const transactionPeriod = toTransactionPeriod(period.year, period.month);
  const sql = `
    WITH breakdown_cte AS (
      SELECT 
        t.charge_id,
        SUM(t.amount) AS amount,
        t.transaction_type
      FROM transactions t
      JOIN charges c ON c.id = t.charge_id
      WHERE t.property_id = :propertyId
      AND t.transaction_period <= :transactionPeriod
      GROUP BY t.charge_id, t.transaction_type
    ), calculated_breakdown AS (
      SELECT
        charge_id,
        CAST(SUM(amount) As decimal) AS amount
      FROM (
        SELECT charge_id, amount FROM breakdown_cte WHERE transaction_type = 'charged'
        UNION ALL SELECT charge_id, (amount * -1) AS amount FROM breakdown_cte WHERE transaction_type = 'collected'
      ) AS breakdown
      GROUP BY charge_id
    )
    SELECT 
      charge_id AS "chargeId", 
      amount 
    FROM calculated_breakdown WHERE amount > 0`;

  const {query} = useSql(db);
  const result = await query<TransactionBreakdownView>(sql, {
    propertyId,
    transactionPeriod,
  });
  return result;
}
