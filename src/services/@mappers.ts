import {
  AuthProfile,
  CategoryAttr,
  ChargeAttr,
  DisbursementAttr,
  ExpenseAttr,
  PaymentDetailAttr,
  ProfileAttr,
  PropertyAssignmentAttr,
  PropertyAttr,
  PurchaseOrderAttr,
  PurchaseRequestAttr,
  SettingAttr,
  TransactionAttr,
  VoucherAttr,
} from '../@types/models';
import Category from '../models/category-model';
import Charge from '../models/charge-model';
import Disbursement from '../models/disbursement-model';
import Expense from '../models/expense-model';
import PaymentDetail from '../models/payment-detail-model';
import Profile from '../models/profile-model';
import PropertyAssignment from '../models/property-assignment-model';
import Property from '../models/property-model';
import PurchaseOrder from '../models/purchase-order-model';
import PurchaseRequest from '../models/purchase-request-model';
import Setting from '../models/setting-model';
import Transaction from '../models/transaction-model';
import Voucher from '../models/voucher-model';

export function mapPaymentDetail(
  paymentDetail: PaymentDetail
): PaymentDetailAttr {
  return {
    id: paymentDetail.id,
    collectedBy: paymentDetail.collectedBy,
    orNumber: paymentDetail.orNumber,
    paymentType: paymentDetail.paymentType,
    checkIssuingBank: paymentDetail.checkIssuingBank,
    checkPostingDate: paymentDetail.checkPostingDate,
    checkNumber: paymentDetail.checkNumber,
    createdAt: paymentDetail.createdAt,
  };
}

export function mapProfile(profile: Profile): ProfileAttr {
  return {
    id: Number(profile.id),
    name: profile.name,
    username: profile.username,
    scopes: profile.scopes,
    type: profile.type,
    email: profile.email,
    mobileNumber: profile.mobileNumber,
    status: profile.status,
    remarks: profile.remarks,
    password: '', //intentionally excluding passwords here
  };
}

export function mapAuthProfile(profile: Profile): AuthProfile {
  return {
    id: Number(profile.id),
    name: profile.name,
    username: profile.username,
    scopes: profile.scopes,
    type: profile.type,
    email: profile.email,
    mobileNumber: profile.mobileNumber,
    status: profile.status,
    remarks: profile.remarks,
  };
}

export function mapProperty(model: Property): PropertyAttr {
  return {
    id: Number(model.id),
    address: model.address,
    code: model.code,
    floorArea: model.floorArea,
    status: model.status,
  };
}

export function mapPropertyAssignment(
  model: PropertyAssignment
): PropertyAssignmentAttr {
  return {
    profileId: model.profileId,
    propertyId: model.propertyId,
    profile: model.profile,
    property: model.property,
  };
}

export function mapTransaction(model: Transaction): TransactionAttr {
  return {
    id: model.id,
    chargeId: model.chargeId,
    charge: model.charge,
    propertyId: model.propertyId,
    property: model.property,
    amount: model.amount,
    transactionPeriod: model.transactionPeriod,
    transactionType: model.transactionType,
    waivedBy: model.waivedBy,
    comments: model.comments,
    paymentDetailId: model.paymentDetailId,
    paymentDetail: model.paymentDetail,
    rateSnapshot: model.rateSnapshot,
    batchId: model.batchId,
    createdAt: model.createdAt,
  };
}

export function mapSetting(model: Setting): SettingAttr {
  return {
    key: model.key,
    value: model.value,
  };
}

export function mapCharge(model: Charge): ChargeAttr {
  return {
    id: model.id,
    chargeType: model.chargeType,
    code: model.code,
    communityId: model.communityId,
    postingType: model.postingType,
    rate: model.rate,
    priority: model.priority,
    thresholdInMonths: model.thresholdInMonths,
    passOn: model.passOn,
  };
}

export function mapExpense(model: Expense): ExpenseAttr {
  return {
    categoryId: model.categoryId,
    category: model.category,
    description: model.description,
    quantity: model.quantity,
    totalCost: model.totalCost,
    unitCost: model.unitCost,
    waivedBy: model.waivedBy,
    voucherId: model.voucherId,
    purchaseRequestId: model.purchaseRequestId,
    purchaseOrderId: model.purchaseOrderId,
  };
}

export function mapVoucher(model: Voucher): VoucherAttr {
  return {
    id: model.id,
    chargeId: model.chargeId,
    description: model.description,
    requestedBy: model.requestedBy,
    requestedDate: model.requestedDate,
    status: model.status,
    totalCost: model.totalCost,
    approvedBy: model.approvedBy,
    rejectedBy: model.rejectedBy,
    expenses: model.expenses,
    disbursements: model.disbursements,
    comments: model.comments,
    rejectedByProfile: model.rejectedByProfile
      ? mapProfile(model.rejectedByProfile as Profile)
      : undefined,
    requestedByProfile: model.requestedByProfile
      ? mapProfile(model.requestedByProfile as Profile)
      : undefined,
    charge: model.charge ? mapCharge(model.charge as Charge) : undefined,
    series: model.series,
  };
}

export function mapPurchaseRequest(
  model: PurchaseRequest
): PurchaseRequestAttr {
  return {
    id: model.id,
    chargeId: model.chargeId,
    description: model.description,
    requestedBy: model.requestedBy,
    requestedDate: model.requestedDate,
    status: model.status,
    totalCost: model.totalCost,
    approvedBy: model.approvedBy,
    rejectedBy: model.rejectedBy,
    expenses: model.expenses,
    comments: model.comments,
    rejectedByProfile: model.rejectedByProfile
      ? mapProfile(model.rejectedByProfile as Profile)
      : undefined,
    requestedByProfile: model.requestedByProfile
      ? mapProfile(model.requestedByProfile as Profile)
      : undefined,
    series: model.series,
  };
}

export function mapPurchaseOrder(model: PurchaseOrder): PurchaseOrderAttr {
  return {
    id: model.id,
    chargeId: model.chargeId,
    description: model.description,
    requestedBy: model.requestedBy,
    requestedDate: model.requestedDate,
    status: model.status,
    totalCost: model.totalCost,
    approvedBy: model.approvedBy,
    rejectedBy: model.rejectedBy,
    expenses: model.expenses,
    disbursements: model.disbursements,
    comments: model.comments,
    rejectedByProfile: model.rejectedByProfile
      ? mapProfile(model.rejectedByProfile as Profile)
      : undefined,
    requestedByProfile: model.requestedByProfile
      ? mapProfile(model.requestedByProfile as Profile)
      : undefined,
    fulfillmentDate: model.fulfillmentDate,
    purchaseRequestId: model.purchaseRequestId,
    vendorName: model.vendorName,
    otherDetails: model.otherDetails,
    series: model.series,
  };
}

export function mapDisbursement(model: Disbursement): DisbursementAttr {
  return {
    id: model.id,
    amount: model.amount,
    details: model.details,
    paymentType: model.paymentType,
    releasedBy: model.releasedBy,
    chargeId: model.chargeId,
    voucherId: model.voucherId,
    purchaseOrderId: model.purchaseOrderId,
    checkIssuingBank: model.checkIssuingBank,
    checkNumber: model.checkNumber,
    checkPostingDate: model.checkPostingDate,
    releasedByProfile: model.releasedByProfile
      ? mapProfile(model.releasedByProfile as Profile)
      : undefined,
    charge: model.charge ? mapCharge(model.charge as Charge) : undefined,
    createdAt: model.createdAt,
  };
}

export function mapCategories(model: Category): CategoryAttr {
  return {
    id: model.id,
    communityId: model.communityId,
    description: model.description,
    subCategories: model.subCategories,
  };
}
