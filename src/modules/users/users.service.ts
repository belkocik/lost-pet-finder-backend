import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/modules/drizzle/drizzle.service';
import { user } from 'src/modules/drizzle/schema';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}
  async findOneWithEmail(email: string) {
    return await this.drizzleService.query.user.findFirst({
      where: eq(user.email, email),
    });
  }
}
