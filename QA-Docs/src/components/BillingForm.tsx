"use client";

import React from "react";
import { getUserSubscriptionPlan } from "@/config/stripe";
import toast from "react-hot-toast";
import { trpc } from "@/app/_trpc/client";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import Container from "./Container";

interface BillingFormProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
  const { mutate: createStripeSession, isLoading } =
    trpc.createStripeSession.useMutation({
      onSuccess: ({ url }) => {
        console.log("url", url);
        if (url) window.location.href = url;
        if (!url) {
          toast.error("Something Went Wrong!");
        }
      },
    });

  return (
    <Container className="max-w-5xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          createStripeSession();
        }}
      >
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Subscription Plan</CardTitle>
            <CardDescription className="text-gray-400">
              You are currently on the{" "}
              <strong className="text-primary">{subscriptionPlan.name}</strong>{" "}
              plan.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? "Manage Subscription"
                : "Upgrade to PRO"}
            </Button>
            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium text-gray-400">
                {subscriptionPlan.isCanceled
                  ? "Your plan will be canceled on "
                  : "Your plan renews on "}
                <span className="text-gray-300">
                  {format(
                    subscriptionPlan.stripeCurrentPeriodEnd!,
                    "dd.MM.yyyy"
                  )}
                </span>
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </Container>
  );
};

export default BillingForm;
