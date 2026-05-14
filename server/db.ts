import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  categories,
  doubts,
  quranicEvidences,
  hadithEvidences,
  scholarStatements,
  realityRefutations,
  statistics,
  aiTaskLogs,
  InsertDoubt,
  InsertStatistics,
  InsertAITaskLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Category Queries ============
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.order);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0];
}

// ============ Doubt Queries ============
export async function getPublishedDoubts(limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(doubts)
    .where(eq(doubts.status, 'published'))
    .orderBy(desc(doubts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getDoubtBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(doubts).where(eq(doubts.slug, slug)).limit(1);
  return result[0];
}

export async function getDoubtById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(doubts).where(eq(doubts.id, id)).limit(1);
  return result[0];
}

export async function getDoubtsByCategory(categoryId: number, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(doubts)
    .where(and(eq(doubts.categoryId, categoryId), eq(doubts.status, 'published')))
    .orderBy(desc(doubts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function searchDoubts(query: string, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(doubts)
    .where(and(
      eq(doubts.status, 'published'),
      or(
        like(doubts.title, `%${query}%`),
        like(doubts.content, `%${query}%`),
        like(doubts.refutation, `%${query}%`)
      )
    ))
    .orderBy(desc(doubts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAdminDoubts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(doubts)
    .orderBy(desc(doubts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function createDoubt(data: InsertDoubt) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(doubts).values(data);
  return result;
}

export async function updateDoubt(id: number, data: Partial<InsertDoubt>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(doubts).set(data).where(eq(doubts.id, id));
}

export async function deleteDoubt(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(doubts).where(eq(doubts.id, id));
}

export async function incrementDoubtViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(doubts).set({ views: sql`${doubts.views} + 1` }).where(eq(doubts.id, id));
}

// ============ Evidence Queries ============
export async function getDoubtEvidences(doubtId: number) {
  const db = await getDb();
  if (!db) return { quranic: [], hadith: [], scholars: [], reality: [] };
  
  const [quranic, hadith, scholars, reality] = await Promise.all([
    db.select().from(quranicEvidences).where(eq(quranicEvidences.doubtId, doubtId)).orderBy(quranicEvidences.order),
    db.select().from(hadithEvidences).where(eq(hadithEvidences.doubtId, doubtId)).orderBy(hadithEvidences.order),
    db.select().from(scholarStatements).where(eq(scholarStatements.doubtId, doubtId)).orderBy(scholarStatements.order),
    db.select().from(realityRefutations).where(eq(realityRefutations.doubtId, doubtId)).orderBy(realityRefutations.order),
  ]);
  
  return { quranic, hadith, scholars, reality };
}

// ============ Statistics Queries ============
export async function getStatistics() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(statistics).limit(1);
  return result[0];
}

export async function updateStatistics(data: Partial<InsertStatistics>) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(statistics).limit(1);
  if (existing.length === 0) {
    await db.insert(statistics).values(data as InsertStatistics);
  } else {
    await db.update(statistics).set(data).where(eq(statistics.id, existing[0].id));
  }
}

// ============ AI Task Log Queries ============
export async function createAITaskLog(data: InsertAITaskLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiTaskLogs).values(data);
}

export async function updateAITaskLog(id: number, data: Partial<InsertAITaskLog>) {
  const db = await getDb();
  if (!db) return;
  await db.update(aiTaskLogs).set(data).where(eq(aiTaskLogs.id, id));
}

// ============ Initialization ============
export async function initializeStatistics() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(statistics).limit(1);
  if (existing.length === 0) {
    await db.insert(statistics).values({
      totalDoubts: 0,
      totalViews: 0,
      totalVisitors: 0,
    });
  }
}

export async function initializeDefaultCategories() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(categories);
  if (existing.length === 0) {
    const defaultCategories = [
      { name: 'العقيدة', nameEn: 'Creed', color: '#1e40af', order: 1 },
      { name: 'الفقه', nameEn: 'Jurisprudence', color: '#7c3aed', order: 2 },
      { name: 'التاريخ', nameEn: 'History', color: '#0891b2', order: 3 },
      { name: 'العلوم', nameEn: 'Sciences', color: '#059669', order: 4 },
      { name: 'الأخلاق', nameEn: 'Ethics', color: '#dc2626', order: 5 },
      { name: 'الحديث', nameEn: 'Hadith', color: '#ea580c', order: 6 },
      { name: 'التفسير', nameEn: 'Tafsir', color: '#2563eb', order: 7 },
      { name: 'أخرى', nameEn: 'Other', color: '#6b7280', order: 8 },
    ];
    for (const cat of defaultCategories) {
      await db.insert(categories).values(cat).catch(() => {});
    }
  }
}
