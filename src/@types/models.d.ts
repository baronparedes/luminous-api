export interface Profile {
  id?: number;
  name: string;
  username: string;
  password?: string;
  scopes?: string;
}

export interface AuthResult {
  profile: Profile;
  token: string;
}
