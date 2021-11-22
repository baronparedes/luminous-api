import {Sequelize} from 'sequelize-typescript';

import {DisbursementBreakdownView} from '../../@types/views';
import useSql from '../use-sql';

export default async function useDisbursementBreakdown(
  communityId: number,
  db: Sequelize
) {
  const sql = `
    SELECT
        'COMMUNITY EXPENSE' AS code,
        SUM(amount) AS amount
    FROM disbursements d
    JOIN vouchers v ON d.voucher_id = v.id
    WHERE v.status = 'approved' AND v.community_id = :communityId
    UNION ALL
    SELECT
        c.code,
        SUM(amount) AS amount
    FROM disbursements d
    JOIN charges c ON d.charge_id = c.id
    WHERE c.community_id = :communityId
    GROUP BY d.charge_id, c.code`;

  const {query} = useSql(db);
  const result = await query<DisbursementBreakdownView>(sql, {communityId});
  return result;
}
