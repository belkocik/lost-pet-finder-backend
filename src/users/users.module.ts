import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { DrizzleService } from 'src/drizzle/drizzle.service';

@Module({
  imports: [DrizzleModule],
  providers: [UsersService, DrizzleService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
