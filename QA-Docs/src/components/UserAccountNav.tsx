import { getUserSubscriptionPlan } from "@/config/stripe";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { Gem, User } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";

interface UserAccountNavProps {
  email: string | undefined;
  name: string;
  imageUrl: string;
}

const UserAccountNav = async ({
  email,
  imageUrl,
  name,
}: UserAccountNavProps) => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full h-10 w-10 aspect-square bg-gray-800 hover:bg-gray-700 transition-colors">
          <Avatar className="relative w-9 h-9 border-2 border-indigo-500">
            {imageUrl ? (
              <div className="relative aspect-square h-full w-full">
                <Image
                  fill
                  src={imageUrl}
                  alt="profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            ) : (
              <AvatarFallback className="bg-gray-700 text-gray-200">
                <span className="sr-only">{name}</span>
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-gray-900 border border-gray-800 shadow-lg rounded-md p-1"
        align="end"
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && (
              <p className="font-medium text-sm text-gray-200">{name}</p>
            )}
            {email && (
              <p className="w-[200px] truncate text-xs text-gray-400">
                {email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="text-gray-200 hover:bg-gray-800 rounded px-2 py-1.5 transition-colors"
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed ? (
            <Link
              href="/dashboard/billing"
              className="text-gray-200 hover:bg-gray-800 rounded px-2 py-1.5 transition-colors"
            >
              Manage Subscription
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="text-gray-200 hover:bg-gray-800 rounded px-2 py-1.5 transition-colors flex items-center"
            >
              Upgrade
              <Gem className="text-indigo-400 h-4 w-4 ml-1.5" />
            </Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem className="cursor-pointer text-gray-200 hover:bg-gray-800 rounded px-2 py-1.5 transition-colors">
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
