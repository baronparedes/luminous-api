import {PaymentType} from './models';

export type TransactionBreakdownView = {
  chargeId: number;
  amount: number;
};

export type DisbursementBreakdownView = {
  code: string;
  amount: number;
  passOn?: boolean;
};

export type ChargeCollectedView = {
  chargeId: number;
  amount: number;
};

export type PaymentHistoryView = {
  amount: number;
  transactionPeriod: Date;
  code: string;
  orNumber: string;
  paymentType: PaymentType;
  checkNumber?: string;
  checkPostingDate?: Date;
  checkIssuingBank?: string;
  collectedBy: string;
};
