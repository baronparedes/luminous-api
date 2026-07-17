import {Sequelize} from 'sequelize-typescript';

import {PaymentHistoryView} from '../../@types/views';
import useSql from '../use-sql';

export default async function usePaymentHistory(
  propertyId: number,
  year: number,
  db: Sequelize
) {
  // Note: Using SUBSTR/CAST to get the year so it can work both in Postgresql and Sqlite
  const sql = `
    WITH collection_summary_cte AS (
      SELECT
        SUM(amount) AS amount,
        t.transaction_period,
        t.property_id,
        t.payment_detail_id
      FROM transactions t
      WHERE t.transaction_type = 'collected'
      AND SUBSTR(CAST(t.transaction_period AS text), 1, 4) = :year
      AND t.property_id = :propertyId
      GROUP BY t.transaction_period, t.property_id, t.payment_detail_id
    )
    SELECT
        c.amount,
        c.transaction_period AS "transactionPeriod",
        p.code,
        pd.or_number AS "orNumber",
        pd.payment_type AS "paymentType",
        pd.check_number AS "checkNumber",
        pd.check_posting_date AS "checkPostingDate",
        pd.check_issuing_bank AS "checkIssuingBank",
        pf.name AS "collectedBy",
        pd.created_at AS "createdAt",
        pd.id
    FROM collection_summary_cte c
    JOIN properties p ON p.id = c.property_id
    JOIN payment_details pd ON pd.id = c.payment_detail_id
    JOIN profiles pf ON pf.id = pd.collected_by`;

  const {query} = useSql(db);
  const result = await query<PaymentHistoryView>(sql, {
    propertyId,
    year: year.toString(),
  });
  return result;
}
