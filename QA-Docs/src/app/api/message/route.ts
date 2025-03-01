import { db } from "@/db";
import { pc } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validator/sendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest, NextResponse } from "next/server";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export const POST = async (req: NextRequest) => {
//   //endpoint for asking a question to a pdf filek
//   const body = await req.json();

//   // const { getUser } = getKindeServerSession();
//   // const user = await getUser();

//   // const { id: userId } = user;

//   // if (!userId) return new Response("Unauthorized", { status: 401 });

//   const { fileId, message } = SendMessageValidator.parse(body);

//   const file = await db.file.findFirst({
//     where: {
//       id: fileId,
//       // userId,
//     },
//   });

//   if (!file) return new Response("Not found", { status: 404 });

//   await db.message.create({
//     data: {
//       text: message,
//       isUserMessage: true,
//       // userId,
//       fileId,
//     },
//   });

//   const embeddings = new GoogleGenerativeAIEmbeddings({
//     apiKey: process.env.GEMINI_API_KEY,
//     modelName: "embedding-001",
//   });

//   const pineconeIndex = pc.index("qa-docs2");
//   const vectoreStore = await PineconeStore.fromExistingIndex(embeddings, {
//     pineconeIndex,
//     namespace: file.id,
//   });

//   const result = await vectoreStore.similaritySearch(message, 4);

//   const prevMessage = await db.message.findMany({
//     where: {
//       fileId: file.id,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//     take: 6,
//   });

//   const formattedPrevMessage = prevMessage.map((msg) => ({
//     role: msg.isUserMessage ? "user" : "model",
//     parts: msg.text,
//   }));

//   const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//   const chat = model.startChat({
//     history: [
//       {
//         role: "user",
//         parts: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer.

// PREVIOUS CONVERSATION:
// ${formattedPrevMessage
//   .map((message) => {
//     if (message.role === "user") return `User: ${message.parts}\n`;
//     return `Assistant: ${message.parts}\n`;
//   })
//   .join("\n")}

// CONTEXT:
// ${result.map((r) => r.pageContent).join("\n\n")}`,
//       },
//       {
//         role: "model",
//         parts:
//           "Understood. I'll use the provided context and previous conversation to answer the user's question in markdown format. If I don't know the answer, I'll say so directly.",
//       },
//     ],
//   });

//   const response = await chat.sendMessageStream(message);
//   console.log(response);

//   return NextResponse.json({
//     message: "Hello",
//   });
// };

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const { id: userId } = user;

    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { fileId, message } = SendMessageValidator.parse(body);

    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId: userId,
      },
    });

    if (!file) return new NextResponse("Not found", { status: 404 });

    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        fileId,
        userId: userId,
      },
    });

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "embedding-001",
    });

    const pineconeIndex = pc.index("qa-docs2");
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessages = await db.message.findMany({
      where: {
        fileId: file.id,
        userId: userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 6,
    });

    const formattedPrevMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
    }) as GenerativeModel;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer and answer should be from only given context if in given context answer is not present just sat that you don't know,don't make answer from outside context!.
PREVIOUS CONVERSATION:
${formattedPrevMessages
  .map((message) => {
    if (message.role === "user") return `User: ${message.parts[0].text}\n`;
    return `Assistant: ${message.parts[0].text}\n`;
  })
  .join("\n")}
CONTEXT:
${results.map((r) => r.pageContent).join("\n\n")}`,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I'll use the provided context and previous conversation to answer the user's question in markdown format. If I don't know the answer, I'll say so directly.and use only provided context!",
            },
          ],
        },
      ],
    });

    const response = await chat.sendMessage([{ text: message }]);
    const responseText = await response.response.text();

    await db.message.create({
      data: {
        text: responseText,
        isUserMessage: false,
        fileId,
        userId: userId,
      },
    });

    return NextResponse.json({
      message: responseText,
    });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
};
