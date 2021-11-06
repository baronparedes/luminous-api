import {Sequelize} from 'sequelize-typescript';

import {TransactionBreakdownView} from '../../@types/views';
import useSql from '../use-sql';

export default async function useTransactionBreakdown(
  propertyId: number,
  db: Sequelize
) {
  const sql = `
    WITH breakdown_cte AS (
      SELECT 
        t.charge_id,
        SUM(t.amount) AS amount,
        t.transaction_type
      FROM transactions t
      JOIN charges c ON c.id = t.charge_id
      WHERE t.property_id = :propertyId
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
  const result = await query<TransactionBreakdownView>(sql, {propertyId});
  return result;
}
