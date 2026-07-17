import {Sequelize} from 'sequelize-typescript';

import {Month} from '../../@types/models';
import {PropertyCollectionByChargeView} from '../../@types/views';
import {toTransactionPeriod} from '../../@utils/dates';
import useSql from '../use-sql';

export default async function usePropertyCollectedByCharge(
  communityId: number,
  year: number,
  month: Month,
  db: Sequelize
) {
  const transactionPeriod = toTransactionPeriod(year, month);
  const sql = `
    SELECT
        p.id,
        p.code,
        p.address,
        p.floor_area AS "floorArea",
        q.collected,
        c.code AS "chargeCode"
        FROM properties p
        LEFT JOIN (
            SELECT
                t.property_id,
                t.charge_id,
                SUM(t.amount) AS collected
            FROM transactions t
            WHERE t.transaction_type = 'collected' 
            AND t.transaction_period = :transactionPeriod
            GROUP BY property_id, charge_id
        ) q ON p.id = q.property_id
        JOIN charges c ON c.id = q.charge_id
        WHERE p.community_id = :communityId
        ORDER BY p.code, c.code`;

  const {query} = useSql(db);
  const result = await query<PropertyCollectionByChargeView>(sql, {
    communityId,
    transactionPeriod,
  });
  return result;
}
