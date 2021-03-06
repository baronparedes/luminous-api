import faker from 'faker';

import {
  AuthProfile,
  CategoryAttr,
  ChargeAttr,
  ChargeType,
  DisbursementAttr,
  ExpenseAttr,
  PaymentDetailAttr,
  PostingType,
  ProfileAttr,
  ProfileType,
  PropertyAccount,
  PropertyAssignmentAttr,
  PropertyAttr,
  PurchaseOrderAttr,
  PurchaseRequestAttr,
  RecordStatus,
  RegisterProfile,
  RequestStatus,
  SettingAttr,
  TransactionAttr,
  TransactionType,
  VoucherAttr,
} from '../@types/models';
import {generateNumberedSeries} from './helpers';

export const generateAuthProfile = (
  type: ProfileType = 'unit owner'
): AuthProfile => {
  return {
    id: faker.datatype.number(),
    name: faker.name.findName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    mobileNumber: faker.phone.phoneNumber(),
    status: faker.random.arrayElement<RecordStatus>(['active', 'inactive']),
    type,
  };
};

export const generateRegisterProfile = (): RegisterProfile => {
  return {
    name: faker.name.findName(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    mobileNumber: faker.phone.phoneNumber(),
  };
};

export const generateProfile = (
  type: ProfileType = 'unit owner'
): ProfileAttr => {
  return {
    id: faker.datatype.number(),
    name: faker.name.findName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    mobileNumber: faker.phone.phoneNumber(),
    status: faker.random.arrayElement<RecordStatus>(['active', 'inactive']),
    type,
    remarks: faker.random.words(),
  };
};

export const generateProperty = (): PropertyAttr => {
  return {
    id: faker.datatype.number(),
    code: faker.datatype.string(),
    floorArea: faker.datatype.number(),
    address: `${faker.address.cityName()} ${faker.address.country()}`,
    status: faker.random.arrayElement<RecordStatus>(['active', 'inactive']),
  };
};

export const generatePropertyAssignment = (): PropertyAssignmentAttr => {
  return {
    profileId: faker.datatype.number(),
    propertyId: faker.datatype.number(),
    property: generateProperty(),
  };
};

export const generatePaymentDetail = (): PaymentDetailAttr => {
  return {
    collectedBy: faker.datatype.number(),
    orNumber: faker.random.alphaNumeric(),
    paymentType: faker.random.arrayElement(['cash', 'check']),
    checkNumber: faker.random.alphaNumeric(),
    checkIssuingBank: faker.random.words(),
    checkPostingDate: faker.datatype.datetime(),
  };
};

export const generateTransaction = (): TransactionAttr => {
  return {
    amount: faker.datatype.number(),
    chargeId: faker.datatype.number(),
    propertyId: faker.datatype.number(),
    transactionPeriod: faker.date.recent(),
    transactionType: faker.random.arrayElement<TransactionType>([
      'charged',
      'collected',
    ]),
    id: faker.datatype.number(),
    comments: faker.random.words(),
    rateSnapshot: faker.datatype.number(),
  };
};

export const generatePropertyAccount = (
  transactionCount = 2
): PropertyAccount => {
  const property = generateProperty();
  const transactions = generateNumberedSeries(transactionCount).map(() =>
    generateTransaction()
  );
  return {
    balance: faker.datatype.number(),
    propertyId: Number(property.id),
    property,
    transactions,
  };
};

export const generateSetting = (): SettingAttr => {
  return {
    key: faker.random.word(),
    value: faker.random.words(),
  };
};

export const generateCategory = (): CategoryAttr => {
  return {
    communityId: faker.datatype.number(),
    description: faker.random.word(),
    subCategories: JSON.stringify([faker.random.words(), faker.random.words()]),
  };
};

export const generateCharge = (): ChargeAttr => {
  return {
    chargeType: faker.random.arrayElement<ChargeType>([
      'amount',
      'percentage',
      'unit',
    ]),
    code: faker.random.alphaNumeric(10),
    communityId: faker.datatype.number(),
    postingType: faker.random.arrayElement<PostingType>([
      'accrued',
      'interest',
      'manual',
      'monthly',
    ]),
    rate: faker.datatype.number(),
    priority: faker.datatype.number(),
    thresholdInMonths: faker.datatype.number(),
    passOn: faker.datatype.boolean(),
  };
};

export const generateExpense = (): ExpenseAttr => {
  const quantity = faker.datatype.number();
  const unitCost = faker.datatype.number();
  return {
    category: faker.random.words(2),
    categoryId: faker.datatype.number(),
    description: faker.random.words(10),
    quantity,
    unitCost,
    totalCost: quantity * unitCost,
  };
};

export const generateVoucher = (): VoucherAttr => {
  return {
    description: faker.random.words(2),
    requestedBy: faker.datatype.number(),
    requestedDate: faker.datatype.datetime(),
    status: faker.random.arrayElement<RequestStatus>([
      'approved',
      'pending',
      'rejected',
    ]),
    totalCost: faker.datatype.number(),
    comments: faker.random.words(10),
    expenses: [generateExpense(), generateExpense()],
    chargeId: faker.datatype.number(),
    series: faker.random.alphaNumeric(10),
  };
};

export const generatePurchaseRequest = (): PurchaseRequestAttr => {
  return {
    description: faker.random.words(2),
    requestedBy: faker.datatype.number(),
    requestedDate: faker.datatype.datetime(),
    status: faker.random.arrayElement<RequestStatus>([
      'approved',
      'pending',
      'rejected',
    ]),
    totalCost: faker.datatype.number(),
    comments: faker.random.words(10),
    expenses: [generateExpense(), generateExpense()],
    chargeId: faker.datatype.number(),
    series: faker.random.alphaNumeric(10),
  };
};

export const generatePurchaseOrder = (): PurchaseOrderAttr => {
  return {
    description: faker.random.words(2),
    requestedBy: faker.datatype.number(),
    requestedDate: faker.datatype.datetime(),
    status: faker.random.arrayElement<RequestStatus>([
      'approved',
      'pending',
      'rejected',
    ]),
    totalCost: faker.datatype.number(),
    comments: faker.random.words(10),
    expenses: [generateExpense(), generateExpense()],
    chargeId: faker.datatype.number(),
    vendorName: faker.random.words(2),
    fulfillmentDate: faker.date.future(),
    purchaseRequestId: faker.datatype.number(),
    otherDetails: faker.random.words(10),
    series: faker.random.alphaNumeric(10),
  };
};

export const generateDisbursement = (): DisbursementAttr => {
  return {
    amount: faker.datatype.number(),
    details: faker.random.words(10),
    paymentType: faker.random.arrayElement(['cash', 'check']),
    checkNumber: faker.random.alphaNumeric(),
    checkIssuingBank: faker.random.words(),
    checkPostingDate: faker.datatype.datetime(),
    releasedBy: faker.datatype.number(),
    chargeId: faker.datatype.number(),
    createdAt: faker.date.recent(),
  };
};
