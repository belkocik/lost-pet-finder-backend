import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { users } from 'src/drizzle/schema';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}
  async findOneWithEmail(email: string) {
    return await this.drizzleService.query.users.findFirst({
      where: eq(users.email, email),
    });
  }
}
