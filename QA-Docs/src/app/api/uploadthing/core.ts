import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { pc } from "@/lib/pinecone";
import { getUserSubscriptionPlan, PLANS } from "@/config/stripe";

const f = createUploadthing();

const handleAuth = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) throw new Error("Unauthorized");
  const subscriptionPlan = await getUserSubscriptionPlan();

  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({ metadata, file }) => {
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: file.url,
      uploadStatus: "PROCESSING",
    },
  });

  const { subscriptionPlan } = metadata;
  const { isSubscribed } = subscriptionPlan;

  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const loader = new PDFLoader(blob);
    const pages = await loader.load();
    const pagesAmt = pages.length;

    const isProExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
    const isFreeExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY!,
      modelName: "embedding-001",
    });

    const pineconeIndex = pc.Index("qa-docs2");
    console.log("process on the vector");

    await PineconeStore.fromDocuments(pages, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });
    console.log("PROCSSEING  ...");
    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });
  } catch (error) {
    console.error("Error processing file:", error);
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
  }
};

export const ourFileRouter = {
  freePlan: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(() => handleAuth())
    .onUploadComplete(onUploadComplete),
  proPlan: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(() => handleAuth())
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
