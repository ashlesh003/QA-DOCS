import React, { useEffect, useRef } from "react";
import { trpc } from "@/app/_trpc/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MessageCircle, User } from "lucide-react";

const Messages = ({ fileId, userId }: { fileId: string; userId: string }) => {
  const { data } = trpc.getFileMessages.useQuery({ fileId });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);

  return (
    <div className="flex flex-col space-y-4 px-4 py-6 bg-gray-900 text-white h-[calc(100vh-120px)] overflow-y-auto">
      {data?.messages?.map((msg, index) => (
        <div
          key={index}
          className={cn(
            "flex w-full",
            msg.isUserMessage ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "flex flex-col max-w-[80%] rounded-lg p-4 shadow-md",
              msg.isUserMessage
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-100"
            )}
          >
            <div className="flex items-center mb-2">
              {msg.isUserMessage ? (
                <User className="h-5 w-5 mr-2 text-gray-300" />
              ) : (
                <MessageCircle className="h-5 w-5 mr-2 text-gray-300" />
              )}
              <span className="font-semibold">
                {msg.isUserMessage ? "You" : "AI Assistant"}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{msg.text}</p>
            <span className="text-xs mt-2 self-end opacity-50">
              {format(new Date(msg.createdAt), "HH:mm")}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
