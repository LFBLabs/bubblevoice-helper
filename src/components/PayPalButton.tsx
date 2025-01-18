import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PayPalButtonProps {
  amount: string;
  planType: "monthly" | "annual";
}

const PLAN_IDS = {
  monthly: "P-85M1675421680423TM6FMVGA",
  annual: "P-1PE850798P928170PM6FMXLA",
};

const PayPalButton = ({ planType }: PayPalButtonProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const planId = PLAN_IDS[planType];

  if (!planId) {
    console.error(`No plan ID found for plan type: ${planType}`);
    return <div className="text-red-500">Configuration error: Invalid plan ID</div>;
  }

  const handleSubscriptionSuccess = async (details: any) => {
    try {
      setIsProcessing(true);
      console.log("Processing subscription with details:", details);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("No valid session found. Please log in again.");
      }

      const validUntil = new Date();
      switch (planType) {
        case "monthly":
          validUntil.setMonth(validUntil.getMonth() + 1);
          break;
        case "annual":
          validUntil.setFullYear(validUntil.getFullYear() + 1);
          break;
      }

      const { error: insertError } = await supabase.from("payments").insert({
        payment_id: details.orderID,
        status: "active",
        amount: planType === "monthly" ? 29.99 : 299.99,
        user_id: session.user.id,
        subscription_id: details.subscriptionID,
        subscription_status: "active",
        plan_type: planType,
        valid_until: validUntil.toISOString(),
      });

      if (insertError) throw insertError;

      toast({
        title: "Subscription Successful",
        description: `Your ${planType} subscription is now active`,
      });
      
      navigate('/');
      
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save subscription details",
      });
      
      if (error.message.includes("session")) {
        navigate('/login');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="text-lg">Processing payment...</div>
        </div>
      )}
      <PayPalButtons
        style={{
          shape: "rect",
          color: "blue",
          layout: "vertical",
          label: "subscribe"
        }}
        createSubscription={(data, actions) => {
          console.log("Creating subscription with plan ID:", planId);
          return actions.subscription.create({
            plan_id: planId,
            application_context: {
              shipping_preference: "NO_SHIPPING",
              user_action: "SUBSCRIBE_NOW",
              return_url: window.location.origin + "/payment",
              cancel_url: window.location.origin + "/payment"
            }
          }).catch(err => {
            console.error("Subscription creation error:", err);
            toast({
              variant: "destructive",
              title: "Subscription Error",
              description: "Failed to create subscription. Please try again.",
            });
            throw err;
          });
        }}
        onApprove={async (data, actions) => {
          console.log("Subscription approved:", data);
          await handleSubscriptionSuccess(data);
        }}
        onCancel={() => {
          console.log("Subscription cancelled by user");
          toast({
            title: "Subscription Cancelled",
            description: "You have cancelled the subscription process.",
          });
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          toast({
            variant: "destructive",
            title: "Subscription Error",
            description: "There was an error processing your subscription. Please try again later.",
          });
        }}
      />
    </div>
  );
};

export default PayPalButton;