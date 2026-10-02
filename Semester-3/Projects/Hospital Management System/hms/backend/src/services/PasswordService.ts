import bcrypt from 'bcryptjs';

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, passwordHash: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements IPasswordHasher {
  public constructor(private readonly rounds = 12) {}

  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  public async verify(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
