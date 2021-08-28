export type ProfileType = 'stakeholder' | 'admin' | 'user';

export interface AuthProfile {
  id: number;
  name: string;
  username: string;
  scopes?: string;
  type: ProfileType;
  email: string;
}
export interface RegisterProfile {
  name: string;
  username: string;
  password: string;
  email: string;
}

export interface AuthResult {
  profile: AuthProfile;
  token: string;
}
