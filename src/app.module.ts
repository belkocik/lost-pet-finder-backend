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
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { AtGuard } from './common/guards';
import { APP_GUARD } from '@nestjs/core';

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
  ],
  controllers: [],
  providers: [
    MyConfigService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
