import BillingForm from "@/components/BillingForm";
import { getUserSubscriptionPlan } from "@/config/stripe";

const Page = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan();
  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Page;
