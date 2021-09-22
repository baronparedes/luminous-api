export type ProfileType = 'stakeholder' | 'admin' | 'unit owner';
export type ChargeType = 'unit' | 'percentage' | 'amount';
export type PostingType = 'monthly' | 'manual' | 'accrued' | 'interest';
export type PaymentType = 'cash' | 'check';
export type TransactionType = 'charged' | 'collected';
export type RecordStatus = 'active' | 'inactive';
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
  transactions?: TransactionAttr[];
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
  communityId: number;
  community?: CommunityAttr;
  code: string;
  rate: number;
  chargeType: ChargeType;
  postingType: PostingType;
  thresholdInMonths?: number;
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
}
