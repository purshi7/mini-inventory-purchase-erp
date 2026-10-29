
import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: { ondismiss?: () => void };
      theme?: { color: string };
    }) => { open: () => void };
  }
}

type CreatedOrder = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
};

type VerifiedPayment = {
  orderId: string;
  paymentId: string;
  status: string;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayPayment() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [paid, setPaid] = useState(false);

  async function startPayment() {
    setBusy(true);
    setMessage("");
    setPaid(false);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Could not load Razorpay Checkout. Check your internet connection.");
      }

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
      });

      if (!orderResponse.ok) {
        throw new Error(await orderResponse.text() || "Could not create payment order.");
      }

      const order: CreatedOrder = await orderResponse.json();

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Boomax Inventory ERP",
        description: "₹10 Razorpay test payment",
        order_id: order.orderId,
        theme: { color: "#2563eb" },

        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error(
                await verifyResponse.text() || "Payment verification failed."
              );
            }

            const result: VerifiedPayment = await verifyResponse.json();
            if (result.status !== "PAID") {
              throw new Error("The backend has not confirmed the payment.");
            }

            setPaid(true);
            setMessage("Payment signature verified. Status: PAID.");
          } catch (error) {
            setPaid(false);
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed. Contact support before retrying."
            );
          } finally {
            setBusy(false);
          }
        },

        modal: {
          ondismiss: () => {
            setBusy(false);
            setMessage("Checkout closed. Payment status has not been confirmed.");
          },
        },
      });

      checkout.open();
    } catch (error) {
      setBusy(false);
      setMessage(error instanceof Error ? error.message : "Unable to start payment.");
    }
  }

  return (
    <div className="content-card">
      <div className="card-heading">
        <div>
          <h3>Razorpay Test Payment</h3>
          <p>Demo only: fixed ₹10 order using Razorpay test-mode credentials.</p>
        </div>
      </div>

      <p>
        This is a separate payment-gateway demo. It does not record a vendor
        payment or change vendor outstanding balances.
      </p>

      <button
        className="primary-button"
        type="button"
        disabled={busy || paid}
        onClick={() => void startPayment()}
      >
        {busy ? "Processing..." : paid ? "Test payment verified" : "Pay ₹10 (Test Mode)"}
      </button>

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
