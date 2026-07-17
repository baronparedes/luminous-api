import {Sequelize} from 'sequelize-typescript';

import {CategorizedExpenseView} from '../../@types/views';
import useSql from '../use-sql';

export default async function useCategorizedExpense(
  year: number,
  communityId: number,
  db: Sequelize
) {
  const sql = `
    WITH approved_expenses AS (
      SELECT
        e.category,
        ct.description AS "parentCategory",
        e.total_cost AS "totalCost",
        c.code AS "chargeCode",
        c.pass_on AS "passOn",
        CAST(SUBSTR(CAST(v.updated_at AS text), 1, 10) AS Date) AS "transactionPeriod",
        CONCAT('V-', COALESCE(v.series, CAST(v.id AS text))) AS series
      FROM expenses e
      JOIN vouchers v ON v.id = e.voucher_id
      JOIN charges c ON c.id = v.charge_id
      JOIN categories ct ON ct.id = e.category_id
      WHERE v.status = 'approved' AND c.community_id = :communityId
      UNION ALL
      SELECT
        e.category,
        ct.description AS "parentCategory",
        e.total_cost AS "totalCost",
        c.code AS "chargeCode",
        c.pass_on AS "passOn",
        CAST(SUBSTR(CAST(po.updated_at AS text), 1, 10) AS Date) AS "transactionPeriod",
        CONCAT('PO-', COALESCE(po.series, CAST(po.id AS text))) AS series
      FROM expenses e
      JOIN purchase_orders po ON po.id = e.purchase_order_id
      JOIN charges c ON c.id = po.charge_id
      JOIN categories ct ON ct.id = e.category_id
      WHERE po.status = 'approved' AND c.community_id = :communityId
    )
    
    SELECT 
      * 
    FROM approved_expenses q
    WHERE SUBSTR(CAST(q."transactionPeriod" AS text), 1, 4) = :year`;

  const {query} = useSql(db);
  const result = await query<CategorizedExpenseView>(sql, {
    communityId,
    year: year.toString(),
  });
  return result;
}
