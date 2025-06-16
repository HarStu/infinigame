// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  pgEnum,
  index,
  pgTableCreator,
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb
} from "drizzle-orm/pg-core";

export const chatResultEnum = pgEnum("chat_result", ['won', 'lost', 'ongoing'])

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `infinigame_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const game = pgTable('game', {
  name: text('name').primaryKey(),
  systemPrompt: text('system_prompt').notNull(),
  aiIdentity: text('ai_identity').notNull(),
  userIdentity: text('user_identity').notNull(),
  requiredTools: jsonb(),
  creatorId: text('user_id').notNull().references(() => user.id),
  timesPlayed: integer().default(0),
  score: integer().default(0)
})

export const chat = pgTable('chat', {
  id: text('id').primaryKey(),
  gameName: text('game_ref').notNull().references(() => game.name),
  owner: text('owner').references(() => user.id),
  createdOn: timestamp().notNull(),
  status: chatResultEnum('chat_result').notNull().default('ongoing')
})

export const message = pgTable('message', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  content: text('content').notNull(),
  reasoning: text('reasoning').notNull(),
  role: text('role').notNull(),
  data: jsonb(),
  toolInvocations: jsonb(),
  parts: jsonb(),
  chatId: text('chat_id').notNull().references(() => chat.id)
})