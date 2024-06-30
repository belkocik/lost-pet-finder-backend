import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  lastName: text('lastName'),
  email: text('email').unique(),
  password: text('password'),
  fullName: text('fullName'),
  hashedRefreshToken: text('hashedRefreshToken'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});
