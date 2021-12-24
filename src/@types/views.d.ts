import {PaymentType, TransactionType} from './models';

export type DashboardView = {
  year: number;
  collectionEfficieny: CollectionEfficiencyView[];
  propertyBalance: PropertyBalanceView[];
  chargeDisbursed: ChargeDisbursedView[];
  categorizedExpense: CategorizedExpenseView[];
  propertyBalanceByCharge: PropertyBalanceByChargeView[];
};

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

export type CollectionEfficiencyView = {
  amount: number;
  transactionPeriod: Date;
  transactionType: TransactionType;
};

export type ChargeDisbursedView = {
  amount: number;
  transactionPeriod: Date;
  chargeId: number;
};

export type PropertyBalanceView = {
  id: number;
  code: string;
  charged: number;
  collected: number;
  balance: number;
};

export type PropertyBalanceByChargeView = {
  id: number;
  code: string;
  address: string;
  floorArea: string;
  balance: number;
  chargeCode: string;
};

export type CategorizedExpenseView = {
  categoryId: number;
  description: string;
  category: string;
  amount: number;
};
