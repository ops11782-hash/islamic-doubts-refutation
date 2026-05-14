import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllCategories,
  getPublishedDoubts,
  getDoubtBySlug,
  getDoubtsByCategory,
  searchDoubts,
  getDoubtEvidences,
  getStatistics,
  getAdminDoubts,
  createDoubt,
  updateDoubt,
  deleteDoubt,
  incrementDoubtViews,
  initializeDefaultCategories,
  initializeStatistics,
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Doubts and Refutations
  doubts: router({
    // Get all published doubts with pagination
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(10), offset: z.number().min(0).default(0) }))
      .query(async ({ input }) => {
        return getPublishedDoubts(input.limit, input.offset);
      }),
    
    // Get doubt by slug
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const doubt = await getDoubtBySlug(input.slug);
        if (!doubt) throw new TRPCError({ code: 'NOT_FOUND' });
        await incrementDoubtViews(doubt.id);
        return doubt;
      }),
    
    // Get doubt with all evidences
    withEvidences: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const doubt = await getDoubtBySlug(input.slug);
        if (!doubt) throw new TRPCError({ code: 'NOT_FOUND' });
        const evidences = await getDoubtEvidences(doubt.id);
        return { doubt, evidences };
      }),
    
    // Get doubts by category
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number(), limit: z.number().min(1).max(100).default(10), offset: z.number().min(0).default(0) }))
      .query(async ({ input }) => {
        return getDoubtsByCategory(input.categoryId, input.limit, input.offset);
      }),
    
    // Search doubts
    search: publicProcedure
      .input(z.object({ query: z.string().min(1), limit: z.number().min(1).max(100).default(10), offset: z.number().min(0).default(0) }))
      .query(async ({ input }) => {
        return searchDoubts(input.query, input.limit, input.offset);
      }),
    
    // Admin: Get all doubts (draft, published, archived)
    adminList: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(20), offset: z.number().min(0).default(0) }))
      .query(async ({ input }) => {
        return getAdminDoubts(input.limit, input.offset);
      }),
    
    // Admin: Create doubt
    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        content: z.string().min(1),
        categoryId: z.number(),
        refutation: z.string().min(1),
        status: z.enum(['draft', 'published', 'archived']).default('draft'),
      }))
      .mutation(async ({ input }) => {
        return createDoubt({
          ...input,
          createdBy: 1,
          isAIGenerated: 0,
        });
      }),
    
    // Admin: Update doubt
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        refutation: z.string().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateDoubt(id, data);
        return { success: true };
      }),
    
    // Admin: Delete doubt
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDoubt(input.id);
        return { success: true };
      }),
  }),
  
  // Categories
  categories: router({
    list: publicProcedure.query(async () => {
      await initializeDefaultCategories();
      return getAllCategories();
    }),
  }),
  
  // Statistics
  stats: router({
    get: publicProcedure.query(async () => {
      await initializeStatistics();
      return getStatistics();
    }),
  }),
});

export type AppRouter = typeof appRouter;
