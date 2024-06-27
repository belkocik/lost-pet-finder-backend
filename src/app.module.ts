import { Module } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { MyConfigService } from './config/config.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [MyConfigService],
})
export class AppModule {}
