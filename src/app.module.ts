import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { DrizzleService } from './drizzle/drizzle.service';
import { MyConfigService } from './config/config.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, MyConfigService, DrizzleService],
})
export class AppModule {}
