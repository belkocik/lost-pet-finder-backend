import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as postgres from 'postgres';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';

type DrizzleFn = typeof drizzle<typeof schema>;
const Drizzle = drizzle as unknown as {
  new (...args: Parameters<DrizzleFn>): ReturnType<DrizzleFn>;
};

@Injectable()
export class DrizzleService
  extends Drizzle
  implements OnModuleInit, OnModuleDestroy
{
  private client: ReturnType<typeof postgres>;
  private migrationClient: ReturnType<typeof postgres>;

  constructor(private configService: ConfigService) {
    const dbUrl = configService.get('DATABASE_URL');
    const client = postgres(dbUrl);
    const migrationClient = postgres(dbUrl, {
      max: 1,
    });
    super(client, { schema, logger: true });
    this.client = client;
    this.migrationClient = migrationClient;
    // Object.setPrototypeOf(Object.getPrototypeOf(this), DbService.prototype);
    Object.setPrototypeOf(Object.getPrototypeOf(this), Drizzle.prototype);
  }

  async onModuleInit() {
    await migrate(drizzle(this.migrationClient, { schema, logger: true }), {
      migrationsFolder: './migrations',
      migrationsSchema: 'public',
    });
    this.migrationClient.end();
  }

  async onModuleDestroy() {
    await Promise.all([this.migrationClient.end(), this.client.end()]);
  }
}
