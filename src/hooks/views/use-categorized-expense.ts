import {Sequelize} from 'sequelize-typescript';

import {CategorizedExpenseView} from '../../@types/views';
import useSql from '../use-sql';

export default async function useCategorizedExpense(
  year: number,
  communityId: number,
  db: Sequelize
) {
  const sql = `
    SELECT
        e.category,
        e.category_id AS "categoryId",
        e.description,
        SUM(e.total_cost) AS amount
    FROM (
    SELECT
        e.category_id,
        c.description,
        e.category,
        e.total_cost,
        po.requested_date
    FROM expenses e
    JOIN purchase_orders po ON po.id = e.purchase_order_id AND po.status = 'approved'
    JOIN charges ch ON ch.id = po.charge_id AND ch.community_id = :communityId
    JOIN categories c ON c.id = e.category_id
    UNION ALL
    SELECT
        e.category_id,
        c.description,
        e.category,
        e.total_cost,
        v.requested_date
    FROM expenses e
    JOIN vouchers v ON v.id = e.voucher_id AND v.status = 'approved'
    JOIN charges ch ON ch.id = v.charge_id AND ch.community_id = :communityId
    JOIN categories c ON c.id = e.category_id
    ) e
    WHERE SUBSTR(CAST(e.requested_date AS text), 1, 4) = :year
    GROUP BY e.category, e.category_id, e.description`;

  const {query} = useSql(db);
  const result = await query<CategorizedExpenseView>(sql, {
    communityId,
    year: year.toString(),
  });
  return result;
}
