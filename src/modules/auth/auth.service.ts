import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { DrizzleService } from 'src/modules/drizzle/drizzle.service';
import { user } from 'src/modules/drizzle/schema';
import * as bcrypt from 'bcrypt';
import { and, eq, isNotNull } from 'drizzle-orm';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly drizzleService: DrizzleService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {}

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    try {
      const hashedPassword = await this.hashData(dto.password);
      const [newUser] = await this.drizzleService
        .insert(user)
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
    const userInDb = await this.drizzleService.query.user.findFirst({
      where: eq(user.email, dto.email),
    });
    if (!userInDb)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const passwordMatches = await bcrypt.compare(
      dto.password,
      userInDb.password,
    );
    if (!passwordMatches)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const tokens = await this.getTokens(userInDb.id, userInDb.email);
    await this.updateRtHash(userInDb.id, tokens.refreshToken);

    return tokens;
  }
  async logout(userId: number) {
    await this.drizzleService
      .update(user)
      .set({ hashedRefreshToken: null })
      .where(and(eq(user.id, userId), isNotNull(user.hashedRefreshToken)));
  }
  async refreshTokens(userId: number, refreshToken: string) {
    const userInDb = await this.drizzleService.query.user.findFirst({
      where: eq(user.id, userId),
    });
    if (!userInDb || !userInDb.hashedRefreshToken)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      userInDb.hashedRefreshToken,
    );
    if (!refreshTokenMatches)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const tokens = await this.getTokens(userInDb.id, userInDb.email);
    await this.updateRtHash(userInDb.id, tokens.refreshToken);

    return tokens;
  }

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
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: 60 * 15, // 15 minutes
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
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
      .update(user)
      .set({ hashedRefreshToken: hash })
      .where(eq(user.id, userId));
  }
}
