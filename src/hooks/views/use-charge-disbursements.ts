import {Sequelize} from 'sequelize-typescript';

import {ChargeDisbursedView} from '../../@types/views';
import useSql from '../use-sql';

export default async function useChargeDisbursements(
  year: number,
  db: Sequelize
) {
  // postgresql only
  const sql = `
    SELECT
      TO_CHAR(d.created_at, 'YYYY-MM-01') AS "transactionPeriod",
      SUM(amount) AS amount,
      charge_id as "chargeId"
    FROM disbursements d
    WHERE EXTRACT(YEAR FROM d.created_at) = :year
    GROUP BY TO_CHAR(d.created_at, 'YYYY-MM-01'), charge_id`;

  const {query} = useSql(db);
  const result = await query<ChargeDisbursedView>(sql, {
    year,
  });
  return result;
}
