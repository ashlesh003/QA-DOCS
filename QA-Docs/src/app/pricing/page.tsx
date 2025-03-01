import React from "react";
import Container from "@/components/Container";
import UpgradeButton from "@/components/UpgradeButton";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLANS } from "@/config/stripe";
import { cn } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const pricingItems = [
    {
      plan: "Free",
      tagline: "For small side projects.",
      quota: 10,
      features: [
        {
          text: "5 pages per PDF",
          footnote: "The maximum amount of pages per PDF-file.",
        },
        {
          text: "4MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
          negative: true,
        },
        {
          text: "Priority support",
          negative: true,
        },
      ],
    },
    {
      plan: "Pro",
      tagline: "For larger projects with higher needs.",
      quota: PLANS.find((p) => p.slug === "pro")!.quota,
      features: [
        {
          text: "25 pages per PDF",
          footnote: "The maximum amount of pages per PDF-file.",
        },
        {
          text: "16MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
        },
        {
          text: "Priority support",
        },
      ],
    },
  ];

  return (
    <>
      <Container className="mb-8 mt-24 text-center max-w-5xl">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl text-white">Pricing</h1>
          <p className="mt-5 text-gray-400 sm:text-lg">
            Whether you&apos;re just trying out our service or need more,
            we&apos;ve got you covered.
          </p>
        </div>

        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price =
                PLANS.find((p) => p.slug === plan.toLowerCase())?.price
                  .amount || 0;

              return (
                <Card
                  key={plan}
                  className={cn(
                    "relative overflow-hidden bg-gray-900 border-gray-800",
                    {
                      "border-primary": plan === "Pro",
                      "border-gray-800": plan !== "Pro",
                    }
                  )}
                >
                  {plan === "Pro" && (
                    <Badge
                      variant="secondary"
                      className="absolute top-4 right-4 bg-primary text-primary-foreground"
                    >
                      Upgrade now
                    </Badge>
                  )}

                  <CardHeader>
                    <h3 className="text-2xl font-bold text-white">{plan}</h3>
                    <p className="text-sm text-gray-400">{tagline}</p>
                  </CardHeader>

                  <CardContent>
                    <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                      ${price}
                      <span className="ml-1 text-2xl font-medium text-gray-400">
                        /month
                      </span>
                    </div>

                    <div className="mt-6 border-t border-gray-800 pt-6">
                      <div className="flex items-center text-gray-300">
                        <p>{quota.toLocaleString()} PDFs/mo included</p>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger className="cursor-default ml-1.5">
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="w-80 p-2 bg-gray-800 text-gray-100">
                            How many PDFs you can upload per month.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-4">
                      {features.map(({ text, footnote, negative }) => (
                        <li key={text} className="flex items-start">
                          <div className="flex-shrink-0">
                            {negative ? (
                              <Minus className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="ml-3 flex items-center">
                            <p
                              className={cn("text-sm", {
                                "text-gray-400": negative,
                                "text-gray-200": !negative,
                              })}
                            >
                              {text}
                            </p>
                            {footnote && (
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger className="cursor-default ml-1.5">
                                  <HelpCircle className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-2 bg-gray-800 text-gray-100">
                                  {footnote}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    {plan === "Free" ? (
                      <Link
                        href={user ? "/dashboard" : "/sign-in"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    ) : user ? (
                      <UpgradeButton />
                    ) : (
                      <Link
                        href="/sign-in"
                        className={buttonVariants({
                          className: "w-full",
                          variant: "default",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </TooltipProvider>
        </div>
      </Container>
    </>
  );
};

export default Page;
