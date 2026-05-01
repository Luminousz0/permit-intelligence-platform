// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeLib = require('stripe');
const stripe = new StripeLib(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-03-31.basil',
});

// Price ID → credits mapping (-1 = Pro subscription, unlimited)
export const CREDIT_MAP: Record<string, number> = {
  'price_1TSNK7JJ8j4Hbj4T5hUe7YkX': 1,   // €29 — 1 report
  'price_1TSNKSJJ8j4Hbj4TegNWqhKd': 5,   // €99 — 5 reports
  'price_1TSNKmJJ8j4Hbj4TjqpvxIYl': 15,  // €249 — 15 reports
  'price_1TSNLBJJ8j4Hbj4TlZMxwjLO': -1,  // €79/month — Pro (unlimited)
};

export interface CheckoutOptions {
  userId: number;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(opts: CheckoutOptions): Promise<string> {
  const credits = CREDIT_MAP[opts.priceId];
  const mode = credits === -1 ? 'subscription' : 'payment';

  const session = await stripe.checkout.sessions.create({
    mode,
    customer_email: opts.userEmail,
    line_items: [{ price: opts.priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: {
      userId: String(opts.userId),
      priceId: opts.priceId,
    },
  });

  return session.url;
}

export function constructWebhookEvent(payload: Buffer, sig: string): any {
  return stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  );
}

export function getCreditsForPriceId(priceId: string): number {
  return CREDIT_MAP[priceId] ?? 0;
}

export { stripe };
