import {Sequelize} from 'sequelize-typescript';

import {CollectionEfficiencyView} from '../../@types/views';
import useSql from '../use-sql';

export default async function useCollectionEfficiency(
  year: number,
  communityId: number,
  db: Sequelize
) {
  const sql = `
    SELECT
        SUM(t.amount) as amount,
        t.transaction_period as "transactionPeriod",
        t.transaction_type as "transactionType",
        c.code as "chargeCode"
    FROM transactions t
    JOIN charges c ON t.charge_id = c.id AND c.community_id = :communityId
    WHERE SUBSTR(CAST(t.transaction_period AS text), 1, 4) = :year
    GROUP BY t.transaction_period, t.transaction_type, c.code
    HAVING SUM(t.amount) > 0
    ORDER BY t.transaction_period`;

  const {query} = useSql(db);
  const result = await query<CollectionEfficiencyView>(sql, {
    communityId,
    year: year.toString(),
  });
  return result;
}
