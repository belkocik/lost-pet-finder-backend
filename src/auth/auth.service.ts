import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { users } from 'src/drizzle/schema';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly drizzleService: DrizzleService,
  ) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'at-secret',
          expiresIn: 60 * 15, // 15 minutes
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7, // 7 days
        },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    try {
      const duplicateUser = await this.drizzleService.query.users.findFirst({
        where: eq(users.email, dto.email),
      });
      console.log(
        '🚀 ~ AuthService ~ signupLocal ~ duplicateUser:',
        duplicateUser,
      );

      if (duplicateUser) {
        throw new ConflictException('This user already exists');
      }

      const hashedPassword = await this.hashData(dto.password);
      const [newUser] = await this.drizzleService
        .insert(users)
        .values({
          email: dto.email,
          password: hashedPassword,
        })
        .returning();

      const tokens = await this.getTokens(newUser.id, newUser.email);

      return tokens;
    } catch (error) {
      console.log('🚀 ~ AuthService ~ signupLocal ~ error:', error);
      throw new BadRequestException(
        'Error while creating a user. Try different email or password',
      );
    }
  }
  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    await this.drizzleService
      .update(users)
      .set({ hashedRefreshToken: hash })
      .where(eq(users.id, userId));
  }
  signinLocal() {}
  logout() {}
  refreshTokens() {}
}
