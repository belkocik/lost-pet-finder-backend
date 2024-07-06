import { Module } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { MyConfigService } from './config/config.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  I18nService,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { AtGuard } from './common/guards';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
    }),
    AuthModule,
    UsersModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),

    ThrottlerModule.forRootAsync({
      inject: [I18nService],
      useFactory: (i18n: I18nService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000,
            limit: 50,
          },
          {
            name: 'long',
            ttl: 60000,
            limit: 1000,
          },
        ],
        errorMessage: i18n.t('global.throttleErrorMessage'),
      }),
    }),
  ],
  controllers: [],
  providers: [
    MyConfigService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
