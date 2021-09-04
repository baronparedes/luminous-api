export type ProfileType = 'stakeholder' | 'admin' | 'user';
export type ProfileStatus = 'active' | 'inactive';

export type AuthProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  mobileNumber?: string;
  type: ProfileType;
  status: ProfileStatus;
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
  status: ProfileStatus;
  scopes?: string;
};

export type AuthResult = {
  profile: AuthProfile;
  token: string;
};
