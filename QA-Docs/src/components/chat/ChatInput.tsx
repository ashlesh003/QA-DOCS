"use client";
import { Loader2, Send, SendHorizonal } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef, useState } from "react";
import { ChatContext } from "./ChatContext";
import toast from "react-hot-toast";
import { trpc } from "@/app/_trpc/client";

interface ChatInputProps {
  fileId?: string;
  isDisabled?: boolean;
}

const ChatInput = ({ fileId, isDisabled }: ChatInputProps) => {
  // const { addMessage, isLoading } = useContext(ChatContext);
  const [message, setMessage] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utils = trpc.useContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    setIsloading(true);
    try {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });
      console.log(response);
      toast.success("Send message !");
      await utils.getFileMessages.invalidate({ fileId });
      setMessage("");
      textareaRef.current?.focus();
    } catch (error) {
      console.log(error);
      toast.error("Some thing went wrong");
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                ref={textareaRef}
                maxRows={4}
                autoFocus
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Enter your question..."
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
              />
              <Button
                disabled={isLoading || isDisabled}
                className="absolute bottom-1.5 right-[8px]"
                aria-label="send message"
                onClick={handleSendMessage}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
