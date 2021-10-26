export type ProfileType = 'stakeholder' | 'admin' | 'unit owner';
export type ChargeType = 'unit' | 'percentage' | 'amount';
export type PostingType = 'monthly' | 'manual' | 'accrued' | 'interest';
export type PaymentType = 'cash' | 'check';
export type TransactionType = 'charged' | 'collected';
export type RecordStatus = 'active' | 'inactive';
export type RequestStatus = 'approved' | 'rejected' | 'pending';
export type Month =
  | 'JAN'
  | 'FEB'
  | 'MAR'
  | 'APR'
  | 'MAY'
  | 'JUN'
  | 'JUL'
  | 'AUG'
  | 'SEP'
  | 'OCT'
  | 'NOV'
  | 'DEC';

export type SavedRecord = {
  id: number;
};

export type Period = {
  year: number;
  month: Month;
};

export type AuthProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  mobileNumber?: string;
  type: ProfileType;
  status: RecordStatus;
  scopes?: string;
  remarks?: string;
};

export type CreatePurchaseRequest = {
  description: string;
  requestedBy: number;
  requestedDate: Date;
  expenses: ExpenseAttr[];
};

export type ApprovePurchaseRequest = {
  purchaseOrderId: number;
  codes: string[];
  disbursements: DisbursementAttr[];
};

export type RegisterProfile = {
  name: string;
  username: string;
  password: string;
  email: string;
  mobileNumber?: string;
};

export type UpdateProfile = {
  name: string;
  email: string;
  mobileNumber?: string;
  type: ProfileType;
  status: RecordStatus;
  scopes?: string;
  remarks?: string | null;
};

export type AuthResult = {
  profile: AuthProfile;
  token: string;
};

export interface PropertyAccount {
  balance: number;
  propertyId: number;
  property?: PropertyAttr;
  assignedProfiles?: ProfileAttr[];
  transactions?: TransactionAttr[];
  paymentDetails?: PaymentDetailAttr[];
}

export interface ChargeCollected {
  charge: ChargeAttr;
  amount: number;
}

export interface ProfileAttr {
  id?: number;
  name: string;
  username: string;
  password: string;
  email: string;
  mobileNumber?: string;
  type: ProfileType;
  status: RecordStatus;
  scopes?: string;
  remarks?: string;
}

export interface PropertyAttr {
  id?: number;
  //communityId: number;  //TODO: Uncomment after enabling multiple communities
  code: string;
  floorArea: number;
  address: string;
  status: RecordStatus;
}

export interface PropertyAssignmentAttr {
  profileId: number;
  propertyId: number;
  profile?: ProfileAttr;
  property?: PropertyAttr;
}

export interface CommunityAttr {
  description: string;
}

export interface ChargeAttr {
  id?: number;
  communityId: number;
  community?: CommunityAttr;
  code: string;
  rate: number;
  chargeType: ChargeType;
  postingType: PostingType;
  thresholdInMonths?: number | null;
  priority?: number | null;
  passOn?: boolean | null;
}

export interface TransactionAttr {
  id?: number;
  chargeId: number;
  charge?: ChargeAttr;
  propertyId: number;
  property?: PropertyAttr;
  amount: number;
  transactionPeriod: Date;
  transactionType: TransactionType;
  waivedBy?: number;
  comments?: string;
  paymentDetailId?: number;
  paymentDetail?: PaymentDetailAttr;
  rateSnapshot?: number;
  batchId?: string | null;
}

export interface SettingAttr {
  key: string;
  value: string;
}

export interface PaymentDetailAttr {
  id?: number;
  collectedBy: number;
  orNumber: string;
  paymentType: PaymentType;
  checkNumber?: string;
  checkPostingDate?: Date;
  checkIssuingBank?: string;
}

export interface ExpenseAttr {
  purchaseOrderId?: number;
  category: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  waivedBy?: number;
}

export interface PurchaseOrderAttr {
  id?: number;
  description: string;
  totalCost: number;
  status: RequestStatus;
  requestedBy: number;
  requestedDate: Date;
  approvedBy?: string | null;
  comments?: string | null;
  expenses?: ExpenseAttr[];
  disbursements?: DisbursementAttr[];
  requestedByProfile?: ProfileAttr;
}

export interface DisbursementAttr {
  id?: number;
  purchaseOrderId?: number;
  chargeId?: number;
  releasedBy: number;
  paymentType: PaymentType;
  details: string;
  checkNumber?: string;
  checkPostingDate?: Date;
  checkIssuingBank?: string;
  amount: number;
}

export type ApprovalCodeAttr = {
  profileId: number;
  email: string;
  code: string;
  purchaseOrderId?: number | null;
};
