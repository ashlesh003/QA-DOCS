import React from "react";
import ChatArea from "@/components/chat/ChatArea";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

const Page = async ({ params }: { params: { fileId: string } }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect(`/auth-callback?origin=dashboard/${params.fileId}`);
  }

  const file = await db.file.findFirst({
    where: {
      id: params.fileId,
      userId: user.id,
    },
  });

  if (!file) notFound();

  return (
    <div className="flex-1 justify-between flex h-[calc(100vh-3.5rem)] bg-gray-900 text-gray-100">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <div className="h-full rounded-lg overflow-hidden shadow-lg border border-gray-700">
              <PDFViewer url={file.url} />
            </div>
          </div>
        </div>
        <div className="shrink-0 flex-[0.75] border-t border-gray-700 lg:w-96 lg:border-l lg:border-t-0">
          <div className="h-full rounded-lg overflow-hidden shadow-lg">
            <ChatArea fileId={file.id} userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
