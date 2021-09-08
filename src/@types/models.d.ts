export type ProfileType = 'stakeholder' | 'admin' | 'user';
export type ChargeType = 'unit' | 'percentage' | 'amount';
export type PostingType = 'monthly' | 'manual' | 'accrued';
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

export type AuthProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  mobileNumber?: string;
  type: ProfileType;
  status: RecordStatus;
  scopes?: string;
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
};

export type AuthResult = {
  profile: AuthProfile;
  token: string;
};

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
  chargeId: number;
  charge?: ChargeAttr;
  propertyId: number;
  property?: PropertyAttr;
  amount: number;
  transactionYear: number;
  transactionMonth: Month;
  transactionType: TransactionType;
  waivedBy?: number;
}
