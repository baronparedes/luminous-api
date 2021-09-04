export type ProfileType = 'stakeholder' | 'admin' | 'user';
export type RecordStatus = 'active' | 'inactive';

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

export interface Profile {
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

export interface UnitProperty {
  id?: number;
  code: string;
  floorArea: number;
  address: string;
  status: RecordStatus;
}
