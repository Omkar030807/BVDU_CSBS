import type { PublicUser } from '../models/User.js';
import { toPublicUser } from '../models/User.js';
import type { IUserRepository } from '../repositories/UserRepository.js';

export class UserService {
  public constructor(private readonly userRepository: IUserRepository) {}

  public async listUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.list();
    return users.map(toPublicUser);
  }
}
