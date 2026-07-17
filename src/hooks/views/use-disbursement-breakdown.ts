import {Sequelize} from 'sequelize-typescript';

import {DisbursementBreakdownView} from '../../@types/views';
import useSql from '../use-sql';

export default async function useDisbursementBreakdown(
  communityId: number,
  db: Sequelize
) {
  const sql = `
    SELECT
      c.pass_on as "passOn",
      c.code,
      SUM(amount) AS amount
    FROM disbursements d
    JOIN charges c ON d.charge_id = c.id
    WHERE c.community_id = 1
    GROUP BY d.charge_id, c.code, c.pass_on`;

  const {query} = useSql(db);
  const result = await query<DisbursementBreakdownView>(sql, {communityId});
  return result;
}
