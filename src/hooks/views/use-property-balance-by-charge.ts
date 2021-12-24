import {Sequelize} from 'sequelize-typescript';

import {PropertyBalanceByChargeView} from '../../@types/views';
import useSql from '../use-sql';

export default async function usePropertyBalanceByCharge(
  communityId: number,
  db: Sequelize
) {
  const sql = `
    SELECT 
        p.id,
        p.code,
        p.address,
        p.floor_area AS "floorArea",
        q.balance,
        c.code AS "chargeCode"
    FROM properties p
    LEFT JOIN (
        SELECT
            t.property_id,
            t.charge_id,
            SUM(
                CASE t.transaction_type
                    WHEN 'collected' THEN (t.amount * -1)
                    ELSE t.amount
                END
            ) AS balance
        FROM transactions t
        GROUP BY t.property_id, t.charge_id
        ORDER BY t.property_id, t.charge_id
    ) q ON q.property_id = p.id
    JOIN charges c ON c.id = q.charge_id
    WHERE p.community_id = :communityId
    ORDER BY p.id, c.code`;

  const {query} = useSql(db);
  const result = await query<PropertyBalanceByChargeView>(sql, {
    communityId,
  });
  return result;
}
