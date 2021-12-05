import bcrypt from 'bcrypt';

export function useHash() {
  const saltRounds = 12;
  const hash = (plainText: string) => {
    const hashed = bcrypt.hashSync(plainText, saltRounds);
    return hashed;
  };
  const compare = (plainText: string, hashed: string) => {
    return bcrypt.compareSync(plainText, hashed);
  };
  return {
    hash,
    compare,
  };
}
