import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { any, z } from "zod";
import { getUserSubscriptionPlan, PLANS } from "@/config/stripe";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export const appRouter = router({
  // api for make entry of users in databses
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user.id || !user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),

  // api to get all files of login user
  getUsersFiles: privateProcedure.query(async ({ ctx }) => {
    {
      const { userId } = ctx;
      return await db.file.findMany({
        where: {
          userId,
        },
      });
    }
  }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),

  getFileMessages: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId } = input;
      const file = await db.file.findFirst({
        where: {
          id: fileId,
        },
      });
      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const messages = await db.message.findMany({
        where: {
          fileId: fileId,
          userId: userId,
        },
      });

      return { messages };
    }),

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    try {
      const { userId } = ctx;

      const billingUrl = absoluteUrl("/dashboard/billing");

      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const dbUser = await db.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      const subscriptionPlan = await getUserSubscriptionPlan();
      console.log(subscriptionPlan);

      if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
        try {
          const stripeSession = await stripe.billingPortal.sessions.create({
            customer: dbUser.stripeCustomerId,
            return_url: billingUrl,
          });
          return { url: stripeSession.url };
        } catch (error) {
          console.log("error", error);
        }
      }

      const stripeSession = await stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        line_items: [
          {
            price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds
              .test,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
        },
      });

      return { url: stripeSession.url };
    } catch (error) {
      console.log("error", error);
    }
  }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),
  // to delete file particular id by user
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id: fileId } = input;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });
      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.file.delete({
        where: {
          id: fileId,
        },
      });

      return file;
    }),
});

export type AppRouter = typeof appRouter;
