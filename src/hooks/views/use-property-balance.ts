import {Sequelize} from 'sequelize-typescript';

import {PropertyBalanceView} from '../../@types/views';
import useSql from '../use-sql';

export default async function usePropertyBalance(
  communityId: number,
  db: Sequelize
) {
  const sql = `
    WITH transactions_by_property AS (
        SELECT
            t.property_id,
            t.transaction_type,
            SUM(amount) AS amount
        FROM transactions t
        GROUP BY t.property_id, t.transaction_type
        ORDER BY t.property_id
    )

    SELECT 
        p.id,
        p.code,
        COALESCE(p_collected.amount, 0) as collected,
        COALESCE(p_charged.amount, 0) as charged,
        (COALESCE(p_charged.amount, 0) - COALESCE(p_collected.amount, 0)) as balance
    FROM properties p
    LEFT JOIN transactions_by_property p_collected 
        ON p_collected.property_id = p.id AND p_collected.transaction_type = 'collected'
    LEFT JOIN transactions_by_property p_charged 
        ON p_charged.property_id = p.id AND p_charged.transaction_type = 'charged'
    WHERE p.community_id = :communityId`;

  const {query} = useSql(db);
  const result = await query<PropertyBalanceView>(sql, {
    communityId,
  });
  return result;
}
