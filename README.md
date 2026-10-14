# Betty — 3D Box Mockup Studio

Starter SaaS application built with Next.js App Router, TypeScript, Tailwind CSS, React Three Fiber, Prisma, PostgreSQL, and Lemon Squeezy.

## Included
- Modern, content-rich landing page and gallery
- Interactive 3D box preview and six-face text/color editor
- Sign-up and sign-in using bcrypt password hashes and an HTTP-only signed session cookie
- Dashboard and subscription status panel
- Pricing plans: $7.20 monthly / 20 downloads; $8.39 every two weeks / 50 downloads; $9.50 every two weeks / 100 downloads; $20.99 every two weeks / unlimited
- Lemon Squeezy checkout creation and signature-verified webhook route
- Server-side download entitlement/limit enforcement
- Privacy, refund, cancellation, and terms pages

## Requirements
Node.js 20+, PostgreSQL, and a Lemon Squeezy store.

## Setup
1. Copy `.env.example` to `.env` and fill in your PostgreSQL URL, `AUTH_SECRET`, `APP_URL`, Lemon Squeezy API key, store ID, webhook secret, and four variant IDs.
2. Install packages: `npm install`
3. Generate Prisma client and create local tables: `npx prisma generate && npx prisma db push`
4. Start development server: `npm run dev`
5. Visit `http://localhost:3000`.

## Lemon Squeezy configuration
Create four products/variants whose prices and billing intervals match the displayed plans. Put their variant IDs in the environment variables. Configure a webhook to `https://YOUR_DOMAIN/api/webhooks/lemonsqueezy` and subscribe to subscription created, updated, resumed, payment success, cancelled, expired, paused, and payment failed events. Set the webhook signing secret in `.env`.

Test all webhook payloads in test mode before launch. Validate the current Lemon Squeezy event schema and ensure each subscription event contains the custom `user_id` field. If your store's event shape differs, update the handler before accepting live payments.

## Important production work
- The download route currently exports project JSON, not a rendered PNG. A production-grade image export pipeline is a separate task; do not advertise PNG export until implemented and tested.
- A full in-app billing portal URL is not yet wired. Configure a server-side portal action using the current Lemon Squeezy API and authenticated subscription/customer data.
- The legal pages are templates, not legal advice. Replace placeholders and have them reviewed for your business and jurisdictions.
- Add rate limiting, email verification, password reset, CSRF protections appropriate to your deployment, abuse monitoring, automated tests, database backups, and error logging before launch.
- Implement and test project loading/editing from persisted data; the current editor starts with a sample project and the download route saves a project snapshot.
- Verify exact pricing and renewal terms in Lemon Squeezy checkout. The backend expects the four plan variant IDs to map to the plans above.
- For strict download-limit reset semantics, reset `downloadsUsed` on verified successful renewal/payment events according to your billing policy. The included webhook currently tracks usage but does not reset it automatically.
