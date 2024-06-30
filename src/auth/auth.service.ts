import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { users } from 'src/drizzle/schema';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly drizzleService: DrizzleService,
    private readonly i18n: I18nService,
  ) {}

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    try {
      const hashedPassword = await this.hashData(dto.password);
      const [newUser] = await this.drizzleService
        .insert(users)
        .values({
          email: dto.email,
          password: hashedPassword,
        })
        .returning();

      const tokens = await this.getTokens(newUser.id, newUser.email);
      await this.updateRtHash(newUser.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.log('🚀 ~ AuthService ~ signupLocal ~ error:', error);
      if (error.code === '23505') {
        throw new ConflictException(this.i18n.t('auth.emailAlreadyExists'));
      }
      throw new BadRequestException(
        this.i18n.t('auth.errorDuringCreatingUser'),
      );
    }
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.drizzleService.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
    if (!user) throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }
  logout() {}
  refreshTokens() {}

  //? Utility functions
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

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    await this.drizzleService
      .update(users)
      .set({ hashedRefreshToken: hash })
      .where(eq(users.id, userId));
  }
}
