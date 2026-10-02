import type { PublicUser } from '../models/User.js';
import { toPublicUser } from '../models/User.js';
import type { IUserRepository } from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';
import type { IPasswordHasher } from './PasswordService.js';
import type { ITokenService } from './TokenService.js';

export interface LoginResult {
  user: PublicUser;
  token: string;
}

export class AuthService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  public async login(email: string, password: string): Promise<LoginResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    // Hashing a supplied password when no account exists keeps missing-account
    // requests computationally similar to a normal bcrypt verification.
    const passwordMatches = user
      ? await this.passwordHasher.verify(password, user.passwordHash)
      : Boolean(await this.passwordHasher.hash(password)) && false;

    if (!user || !user.isActive || !passwordMatches) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }

    const updatedUser = await this.userRepository.updateLastLogin(user.id);
    const token = await this.tokenService.create(updatedUser);

    return { user: toPublicUser(updatedUser), token };
  }

  public async logout(userId: string): Promise<void> {
    await this.userRepository.incrementSessionVersion(userId);
  }

  public async getActiveUser(userId: string, sessionVersion: number): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.isActive || user.sessionVersion !== sessionVersion) {
      throw new AppError(401, 'INVALID_SESSION', 'Your session is no longer active.');
    }

    return toPublicUser(user);
  }
}
