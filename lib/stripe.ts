import { env } from "cloudflare:workers";
import Stripe from "stripe";

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe isn't configured yet. Set the STRIPE_SECRET_KEY secret to enable checkout."
    );
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}
