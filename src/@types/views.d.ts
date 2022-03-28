import {PaymentType, TransactionAttr, TransactionType} from './models';

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
  createdAt: Date;
};

export type CollectionEfficiencyView = {
  amount: number;
  transactionPeriod: Date;
  transactionType: TransactionType;
  chargeCode: string;
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

export type PropertyCollectionByChargeView = {
  id: number;
  code: string;
  address: string;
  floorArea: string;
  collected: number;
  chargeCode: string;
};

export type CategorizedExpenseView = {
  category: string;
  parentCategory: string;
  totalCost: number;
  chargeCode: string;
  passOn?: boolean;
  transactionPeriod: Date;
  series: string;
};

export type PropertyTransactionHistoryView = {
  targetYear: number;
  previousBalance: number;
  transactionHistory: TransactionAttr[];
  paymentHistory: PaymentHistoryView[];
};
