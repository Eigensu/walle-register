// Cashfree JS SDK v3 loader + popup checkout.
// Docs: https://www.cashfree.com/docs/payments/online/web/redirect

const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

export type CashfreeCheckoutResult = {
  error?: { message?: string; code?: string };
  redirect?: boolean;
  paymentDetails?: { paymentMessage?: string };
};

type CashfreeInstance = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_top" | "_modal" | HTMLElement;
  }) => Promise<CashfreeCheckoutResult>;
};

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeInstance;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Cashfree needs a browser"));
  if (window.Cashfree) return Promise.resolve();
  if (!sdkPromise) {
    sdkPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        sdkPromise = null; // allow a retry
        script.remove();
        reject(new Error("Couldn't load Cashfree checkout. Check your connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return sdkPromise;
}

/**
 * Opens Cashfree's checkout as a popup over the current page.
 * Resolves when the popup closes. The result is only a hint: always confirm
 * the payment with the backend (verifyCashfreePayment) afterwards.
 */
export async function openCashfreeCheckout(
  paymentSessionId: string,
  mode: "sandbox" | "production",
): Promise<CashfreeCheckoutResult> {
  await loadSdk();
  if (!window.Cashfree) throw new Error("Cashfree checkout is unavailable. Please retry.");
  const cashfree = window.Cashfree({ mode });
  return cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" });
}
