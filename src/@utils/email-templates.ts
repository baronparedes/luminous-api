import {ExpenseAttr, ProfileAttr} from '../@types/models';

export type ExpenseApprovalRequest = {
  id?: number;
  description: string;
  totalCost: number;
  code: string;
  requestedByProfile?: ProfileAttr;
  expenses?: ExpenseAttr[];
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

export function resetPasswordTemplate(password: string) {
  const html = `
    <p style="font-size:1.1em">Hi,</p>
    <p>You have requested for a password reset.</p>
    <h1 style="background: #03284A;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">
        ${password}
    </h1>
  `;
  return container(html);
}

export function expenseApprovalTemplate(
  request: ExpenseApprovalRequest,
  idPrefix: string
) {
  const html = `
    <p style="font-size:1.1em">Hi,</p>
    <p><strong>${idPrefix}-${
    request.id
  }</strong> has been requested by <strong>${
    request.requestedByProfile?.name
  }</strong></p>
    <p>Use the following OTP for approval of this request.</p>
    <h1 style="background: #03284A;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">
        ${request.code}
    </h1>
    <br/>
    <hr style="border:none;border-top:1px solid #eee" />
    <small>Purpose of the Request</small>
    <p>${request.description}</p>
    <h3>Total Cost: ${request.totalCost}</h3>
    <small>Expenses</small>
    <table style="width: 100%; text-align: left">
        <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Unit Cost</th>
        </tr>
        ${request.expenses?.map(e => {
          return `
            <tr>
                <td>${e.description}</td>
                <td>${e.category}</td>
                <td>${e.quantity}</td>
                <td>${e.unitCost}</td>
            </tr>
            `;
        })}
        <tr>
    </table>
    `;
  return container(html);
}
