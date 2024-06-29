import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  lastName: text('lastName'),
  email: text('email'),
  password: text('password'),
  fullName: text('fullName'),
  hashedRefreshToken: text('hashedRefreshToken'),
});
