"use client";
import React from "react";
import Messages from "./Messages";
import ChatInput from "./ChatInput";
import { trpc } from "@/app/_trpc/client";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatArea = ({ fileId, userId }: { fileId: string; userId: string }) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery({
    fileId,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex justify-center items-center flex-col">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>
      );
    }

    if (data?.status === "PROCESSING") {
      return (
        <div className="flex-1 flex justify-center items-center flex-col">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>
      );
    }

    if (data?.status === "FAILED") {
      return (
        <div className="flex-1 flex justify-center items-center flex-col">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500 " />
            <h3 className="font-semibold text-xl">
              Fail Due to too many pages
            </h3>
            <p className="text-zinc-500 text-sm">Please Try again</p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </Link>
          </div>
        </div>
      );
    }

    return (
      <ScrollArea className="flex-1 h-full">
        <Messages fileId={fileId} userId={userId} />
      </ScrollArea>
    );
  };

  return (
    <div className="relative h-full bg-muted-background flex flex-col">
      {renderContent()}
      <div className="sticky bottom-0 left-0 right-0 bg-muted-background">
        <ChatInput
          isDisabled={!data || data.status !== "SUCCESS"}
          fileId={fileId}
        />
      </div>
    </div>
  );
};

export default ChatArea;
