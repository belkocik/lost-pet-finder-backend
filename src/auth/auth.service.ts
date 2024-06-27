import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneWithEmail(email);
  }
}
