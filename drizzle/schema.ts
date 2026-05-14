import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول التصنيفات (العقيدة، الفقه، التاريخ، العلوم، الأخلاق، إلخ)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 100 }),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 20 }).default("#1e40af"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * جدول الشبهات الرئيسية
 */
export const doubts = mysqlTable("doubts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  categoryId: int("categoryId").notNull().references(() => categories.id),
  refutation: text("refutation").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  views: int("views").default(0),
  isAIGenerated: int("isAIGenerated").default(0),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Doubt = typeof doubts.$inferSelect;
export type InsertDoubt = typeof doubts.$inferInsert;

/**
 * جدول الأدلة القرآنية
 */
export const quranicEvidences = mysqlTable("quranic_evidences", {
  id: int("id").autoincrement().primaryKey(),
  doubtId: int("doubtId").notNull().references(() => doubts.id, { onDelete: "cascade" }),
  surah: varchar("surah", { length: 100 }).notNull(),
  ayahStart: int("ayahStart").notNull(),
  ayahEnd: int("ayahEnd"),
  text: text("text").notNull(),
  explanation: text("explanation"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuranicEvidence = typeof quranicEvidences.$inferSelect;
export type InsertQuranicEvidence = typeof quranicEvidences.$inferInsert;

/**
 * جدول الأحاديث النبوية
 */
export const hadithEvidences = mysqlTable("hadith_evidences", {
  id: int("id").autoincrement().primaryKey(),
  doubtId: int("doubtId").notNull().references(() => doubts.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  grading: varchar("grading", { length: 100 }),
  explanation: text("explanation"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HadithEvidence = typeof hadithEvidences.$inferSelect;
export type InsertHadithEvidence = typeof hadithEvidences.$inferInsert;

/**
 * جدول أقوال العلماء
 */
export const scholarStatements = mysqlTable("scholar_statements", {
  id: int("id").autoincrement().primaryKey(),
  doubtId: int("doubtId").notNull().references(() => doubts.id, { onDelete: "cascade" }),
  scholarName: varchar("scholarName", { length: 255 }).notNull(),
  statement: text("statement").notNull(),
  source: varchar("source", { length: 255 }),
  era: varchar("era", { length: 100 }),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScholarStatement = typeof scholarStatements.$inferSelect;
export type InsertScholarStatement = typeof scholarStatements.$inferInsert;

/**
 * جدول الرد من الواقع
 */
export const realityRefutations = mysqlTable("reality_refutations", {
  id: int("id").autoincrement().primaryKey(),
  doubtId: int("doubtId").notNull().references(() => doubts.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  evidence: text("evidence"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RealityRefutation = typeof realityRefutations.$inferSelect;
export type InsertRealityRefutation = typeof realityRefutations.$inferInsert;

/**
 * جدول الإحصائيات
 */
export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  totalDoubts: int("totalDoubts").default(0),
  totalViews: int("totalViews").default(0),
  totalVisitors: int("totalVisitors").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type Statistics = typeof statistics.$inferSelect;
export type InsertStatistics = typeof statistics.$inferInsert;

/**
 * جدول سجل المهام المجدولة (AI)
 */
export const aiTaskLogs = mysqlTable("ai_task_logs", {
  id: int("id").autoincrement().primaryKey(),
  taskType: varchar("taskType", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  result: text("result"),
  errorMessage: text("errorMessage"),
  doubtId: int("doubtId").references(() => doubts.id),
  executedAt: timestamp("executedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AITaskLog = typeof aiTaskLogs.$inferSelect;
export type InsertAITaskLog = typeof aiTaskLogs.$inferInsert;