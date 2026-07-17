import {Period, PropertyAccount} from '../@types/models';
import {sum} from './helpers';
import {toTransactionPeriodFromDb} from './dates';

type StatementEmailData = {
  propertyAccount: PropertyAccount;
  period: Period;
  waterChargeId?: number;
  notes?: string;
};

function container(content: string) {
  const html = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
                <h2 style="font-family: 'Fredoka One', cursive;">
                    <strong>Luminous</strong>
                </h2>
            </div>
            ${content}
            <hr style="border:none;border-top:1px solid #eee" />
            <br/>
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>This is a system generated message</p>
                <p>Do not reply</p>
            </div>
        </div>
    </div>
    `;
  return html;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

function getOwnerNames(propertyAccount: PropertyAccount): string {
  if (
    !propertyAccount.assignedProfiles ||
    propertyAccount.assignedProfiles.length === 0
  ) {
    return 'N/A';
  }
  return propertyAccount.assignedProfiles.map(p => p.name).join(', ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWaterUsage(transaction: any, waterChargeId: number): string {
  if (transaction.chargeId !== waterChargeId) {
    return '';
  }
  try {
    const comments = JSON.parse(transaction.comments || '{}');
    return comments.usage ? `${comments.usage} cu.m.` : '';
  } catch {
    return '';
  }
}

export function statementEmailTemplate(data: StatementEmailData): string {
  const {propertyAccount, period, waterChargeId, notes} = data;
  const {property, transactions, paymentDetails, balance} = propertyAccount;

  // Calculate balances
  const chargedTransactions =
    transactions?.filter(t => t.transactionType === 'charged') || [];
  const collectedTransactions =
    transactions?.filter(t => t.transactionType === 'collected') || [];

  const currentCharges = sum(chargedTransactions.map(t => t.amount));
  const currentPayments = sum(
    collectedTransactions.map(t => Math.abs(t.amount))
  );
  const previousBalance = balance - currentCharges + currentPayments;
  const currentBalance = balance;

  const transactionRows = chargedTransactions
    .map(t => {
      const unit =
        t.chargeId === waterChargeId
          ? getWaterUsage(t, waterChargeId)
          : property?.floorArea
          ? `${property.floorArea} sq.m.`
          : '';

      return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          t.charge?.code || 'N/A'
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatCurrency(
          t.rateSnapshot || 0
        )}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${unit}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;"><strong>${formatCurrency(
          t.amount
        )}</strong></td>
      </tr>
    `;
    })
    .join('');

  const paymentRows =
    paymentDetails && paymentDetails.length > 0
      ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #666; font-size: 1em;">Received Payments</h3>
      ${paymentDetails
        .map(pd => {
          const pdTransactions =
            transactions?.filter(t => t.paymentDetailId === pd.id) || [];
          const pdAmount = sum(pdTransactions.map(t => Math.abs(t.amount)));
          return `
          <div style="padding: 10px; background: #f9f9f9; margin-bottom: 10px; border-radius: 4px;">
            <strong>Posted On:</strong> ${toTransactionPeriodFromDb(
              pd.createdAt || ''
            )}<br/>
            <strong>OR Number:</strong> ${pd.orNumber || 'N/A'}<br/>
            <strong>Amount:</strong> ${formatCurrency(pdAmount)}
          </div>
        `;
        })
        .join('')}
    </div>
  `
      : '';

  const html = `
    <p style="font-size:1.1em">Dear Property Owner,</p>
    <p>Please find below your Statement of Account for <strong>${
      period.month
    } ${period.year}</strong>.</p>
    
    <hr style="border:none;border-top:1px solid #eee" />
    
    <div style="margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; width: 30%;"><strong>Unit Number:</strong></td>
          <td style="padding: 8px;">${property?.code || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Unit Owner:</strong></td>
          <td style="padding: 8px;">${getOwnerNames(propertyAccount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Address:</strong></td>
          <td style="padding: 8px;">${property?.address || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Floor Area:</strong></td>
          <td style="padding: 8px;">${
            property?.floorArea ? `${property.floorArea} sq.m.` : 'N/A'
          }</td>
        </tr>
      </table>
    </div>

    <hr style="border:none;border-top:1px solid #eee" />

    <div style="margin: 20px 0;">
      <h3 style="color: #03284A;">Billing Period: ${period.month} ${
    period.year
  }</h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #03284A; color: white;">
            <th style="padding: 10px; text-align: left;">Charge Description</th>
            <th style="padding: 10px; text-align: left;">Rate</th>
            <th style="padding: 10px; text-align: left;">Unit</th>
            <th style="padding: 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${transactionRows}
        </tbody>
      </table>
    </div>

    ${paymentRows}

    <hr style="border:none;border-top:1px solid #eee" />

    <div style="margin: 20px 0; background: #f5f5f5; padding: 15px; border-radius: 4px;">
      <table style="width: 100%; font-size: 1.1em;">
        <tr>
          <td style="padding: 5px;"><strong>Previous Balance:</strong></td>
          <td style="padding: 5px; text-align: right;">${formatCurrency(
            previousBalance
          )}</td>
        </tr>
        <tr>
          <td style="padding: 5px;"><strong>Current Charges:</strong></td>
          <td style="padding: 5px; text-align: right;">${formatCurrency(
            currentCharges
          )}</td>
        </tr>
        <tr>
          <td style="padding: 5px;"><strong>Total Payments:</strong></td>
          <td style="padding: 5px; text-align: right;">(${formatCurrency(
            currentPayments
          )})</td>
        </tr>
        <tr style="border-top: 2px solid #03284A;">
          <td style="padding: 10px;"><strong style="font-size: 1.2em;">CURRENT BALANCE:</strong></td>
          <td style="padding: 10px; text-align: right;"><strong style="font-size: 1.2em; color: ${
            currentBalance < 0 ? '#28a745' : '#dc3545'
          };">${formatCurrency(currentBalance)}</strong></td>
        </tr>
      </table>
    </div>

    ${
      notes
        ? `
    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #856404;">Note:</h4>
      <p style="margin-bottom: 0; white-space: pre-wrap;">${notes}</p>
    </div>
    `
        : ''
    }

    <p style="font-size:0.9em; color: #666;">Thank you for your prompt payment. For any concerns, please contact the property management office.</p>
  `;

  return container(html);
}
